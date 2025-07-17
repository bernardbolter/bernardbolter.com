// scripts/cacheImagesAndData.js
import fs from 'fs';
import path from 'path';
import https from 'https';

// You'll need to implement your GraphQL fetch function
async function fetchGraphQLData(query, variables = {}) {
  const response = await fetch('https://digitalcityseries.com/bolter/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });
  
  const result = await response.json();
  
  // Debug logging
  console.log('GraphQL Response:', JSON.stringify(result, null, 2));
  
  if (result.errors) {
    throw new Error(`GraphQL Error: ${result.errors.map(e => e.message).join(', ')}`);
  }
  
  return result.data;
}

const GET_POSTS_WITH_IMAGES_QUERY = `
  query getAllArtwork {
        allArtwork(first: 1000) {
            nodes {
                slug
                artworkFields {
                    city
                    artworklink {
                        url
                        title
                    }
                    artworkImage {
                        mediaDetails {
                            sizes(include: [MEDIUM, LARGE, THUMBNAIL]) {
                                sourceUrl
                                height
                                width
                            }
                            width
                            height
                        }
                        mediaItemUrl
                    }
                    country
                    forsale
                    height
                    lat
                    lng
                    medium
                    metadescription
                    metakeywords
                    orientation
                    proportion
                    series
                    size
                    style
                    width
                    year
                }
                colorfulFields {
                    wikiLinkEn
                    wikiLinkDe
                    storyEn
                    storyDe
                    ar
                }
                title(format: RENDERED)
                content(format: RENDERED)
                databaseId
                id
                date
                featuredImage {
                    node {
                        sourceUrl
                        altText
                    }
                }
            }
        }
    }
`;

async function downloadImage(url, filename) {
  const dir = path.join(process.cwd(), 'public/cached-images');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const filePath = path.join(dir, filename);
  const file = fs.createWriteStream(filePath);
  
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(filePath);
      });
    }).on('error', reject);
  });
}

function getFileExtension(url) {
  const urlParts = url.split('.');
  return urlParts[urlParts.length - 1].split('?')[0]; // Remove query params
}

async function cacheWordPressDataWithImages() {
  try {
    console.log('Fetching WordPress data...');
    
    // Fetch your WordPress data
    const data = await fetchGraphQLData(GET_POSTS_WITH_IMAGES_QUERY);
    
    // Debug: Check what we actually received
    console.log('Available data keys:', Object.keys(data));
    
    // Fixed: Use correct case-sensitive property name
    const posts = data.allArtwork.nodes;
    
    console.log(`Found ${posts.length} posts. Downloading images...`);
    
    // Process each post and download images
    const processedPosts = await Promise.all(posts.map(async (post, postIndex) => {
      console.log(`Processing post ${postIndex + 1}: ${post.title}`);
      
      // Handle featured image
      if (post.featuredImage?.node?.sourceUrl) {
        try {
          const extension = getFileExtension(post.featuredImage.node.sourceUrl);
          const filename = `featured-${post.databaseId}.${extension}`;
          await downloadImage(post.featuredImage.node.sourceUrl, filename);
          
          // Update the URL to point to local cached image
          post.featuredImage.node.sourceUrl = `/cached-images/${filename}`;
          console.log(`  ✓ Downloaded featured image: ${filename}`);
        } catch (error) {
          console.log(`  ✗ Failed to download featured image: ${error.message}`);
        }
      }
      
      // Handle artwork image from artworkFields
      if (post.artworkFields?.artworkImage?.mediaItemUrl) {
        try {
          const extension = getFileExtension(post.artworkFields.artworkImage.mediaItemUrl);
          const filename = `artwork-${post.databaseId}.${extension}`;
          await downloadImage(post.artworkFields.artworkImage.mediaItemUrl, filename);
          
          // Update the URL to point to local cached image
          post.artworkFields.artworkImage.mediaItemUrl = `/cached-images/${filename}`;
          console.log(`  ✓ Downloaded artwork image: ${filename}`);
        } catch (error) {
          console.log(`  ✗ Failed to download artwork image: ${error.message}`);
        }
      }
      
      // Handle artwork image sizes
      if (post.artworkFields?.artworkImage?.mediaDetails?.sizes) {
        post.artworkFields.artworkImage.mediaDetails.sizes = await Promise.all(
          post.artworkFields.artworkImage.mediaDetails.sizes.map(async (size) => {
            try {
              const extension = getFileExtension(size.sourceUrl);
              const filename = `artwork-${post.databaseId}-${size.width}x${size.height}.${extension}`;
              await downloadImage(size.sourceUrl, filename);
              
              console.log(`  ✓ Downloaded artwork size image: ${filename}`);
              return {
                ...size,
                sourceUrl: `/cached-images/${filename}`
              };
            } catch (error) {
              console.log(`  ✗ Failed to download artwork size image: ${error.message}`);
              return size; // Return original if download fails
            }
          })
        );
      }
      
      return post;
    }));
    
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Save processed data
    fs.writeFileSync(
      path.join(process.cwd(), 'data/cached-posts-with-images.json'),
      JSON.stringify(processedPosts, null, 2)
    );
    
    console.log('✅ WordPress data and images cached successfully!');
    console.log(`📁 Data saved to: data/cached-posts-with-images.json`);
    console.log(`🖼️  Images saved to: public/cached-images/`);
    
  } catch (error) {
    console.error('❌ Error caching data and images:', error);
    console.error('Error details:', error.stack);
  }
}

cacheWordPressDataWithImages();