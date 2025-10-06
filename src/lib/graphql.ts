export const getAllArtwork = `
  query getAllArtwork {
    allArtwork(first: 500) {
      nodes {
        content(format: RENDERED)
        date
        id
        title(format: RENDERED)
        slug
        artworkFields {
          area
          artworkImage {
            node {
              altText
              mediaDetails {
                  width
                  height
              }
              srcSet(size: LARGE)
              sourceUrl(size: LARGE)
            }
          }
          artworklink {
            target
            title
            url
          }
          city
          coordinates
          country
          density
          elevation
          extraimages
          forsale
          height
          lat
          lng
          medium
          metadescription
          metakeywords
          performance
          orientation
          population
          proportion
          series
          size
          slug
          style
          width
          year
        }
        colorfulFields {
          storyDe
          storyEn
          wikiLinkDe
          wikiLinkEn
          ar
        }
      }
    }
    biography(id: "cG9zdDo1NzQ=") {
      bio {
        tagline
        bioimage1 {
          node {
            altText
            mediaDetails {
              width
              height
            }
            sourceUrl(size: LARGE)
            srcSet(size: LARGE)
          }
        }
        bioimage2 {
          node {
            altText
            mediaDetails {
              width
              height
            }
            sourceUrl(size: LARGE)
            srcSet(size: LARGE)
          }
        }
        bioimage3 {
          node {
            altText
            mediaDetails {
              width
              height
            }
            sourceUrl(size: LARGE)
            srcSet(size: LARGE)
          }
        }
        bioimage4 {
          node {
            altText
            mediaDetails {
              width
              height
            }
            sourceUrl(size: LARGE)
            srcSet(size: LARGE)
          }
        }
        bioimage5 {
          node {
            altText
            mediaDetails {
              width
              height
            }
            sourceUrl(size: LARGE)
            srcSet(size: LARGE)
          }
        }
      }
      content
    }
    artistInfo(id: "cG9zdDozNQ==") {
      id
      artistData {
        birthcity
        birthyear
        fieldGroupName
        link1 {
          target
          title
          url
        }
        link2 {
          target
          title
          url
        }
        link3 {
          target
          title
          url
        }
        link4 {
          target
          title
          url
        }
        link5 {
          target
          title
          url
        }
        name
        workcity1
        workcity2
        workcity3
      }
    }
    cvinfos(first: 500) {
      nodes {
        cvInfoFields {
          city
          gallery
          role
          school
          section
          title
          year
        }
      }
    }
  }
`

export const getSingleArtwork = ` 
  query GetArtworkBySlug($slug: ID!) {
    artwork(id: $slug, idType: SLUG) {
      id
      title
      slug
      date
      content
      databaseId
      artworkFields {
        artworkImage {
          node {
            altText
            mediaDetails {
              width
              height
            }
            srcSet(size: LARGE)
            sourceUrl(size: LARGE)
          }
        }
        width
        height
        medium
        style
        orientation
        size
        series
        city
        country
        lat
        lng
        year
        forsale
        proportion
        metadescription
        metakeywords
        artworklink {
          url
          title
        }
      }
      colorfulFields {
        wikiLinkEn
        wikiLinkDe
        storyEn
        storyDe
        ar
      }
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
    }
  }
`;