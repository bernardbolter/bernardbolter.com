// Fragment for all the necessary image data
const ImageFields = `
  node {
    altText
    sourceUrl(size: LARGE)
    srcSet(size: LARGE)
    mediaDetails {
      width
      height
    }
  }
`;

export const getAllArtwork = `
  query getAllArtwork {
    allArtwork(first: 500) {
      nodes {
        id
        title(format: RENDERED)
        slug
        artworkFields {
          area
          artworkImage { ${ImageFields} }
          artworklink {
            target
            title
            url
          }
          city
          coordinates
          country
          dcsFlags { ${ImageFields} }
          dcsPhoto { ${ImageFields} }
          dcsPhotoTitle
          dcsRaw { ${ImageFields} }
          dcsSatellite { ${ImageFields} }
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
          orientation
          performance
          population
          proportion
          series
          size
          slug
          style
          units
          width
          year
          artworkImage2 { ${ImageFields} } 
          artworkImage3 { ${ImageFields} }
          artworkImage4 { ${ImageFields} }
          artworkImage5 { ${ImageFields} }
          artworkImage6 { ${ImageFields} }
          artworkImage7 { ${ImageFields} }
          artworkImage8 { ${ImageFields} }
          artworkImage9 { ${ImageFields} }
          hasMoreImages
          video {
            node {
              altText
              mediaDetails {
                height
                width
              }
              sourceUrl(size: LARGE)
              uri
            }
          }
          videoPoster { ${ImageFields} }
          videoYouttubeLink
        }
        date
        dateGmt
        databaseId
        colorfulFields {
          storyEn
          wikiLinkEn
          ar
        }
      }
    }
    biography(id: "cG9zdDo1NzQ=") {
      content(format: RENDERED)
      bio {
        tagline
        bioimage1 { ${ImageFields} }
        bioimage2 { ${ImageFields} }
        bioimage3 { ${ImageFields} }
        bioimage4 { ${ImageFields} }
        bioimage5 { ${ImageFields} }
      } 
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
      title(format: RENDERED)
      content(format: RENDERED)
      artworkFields {
        area
        artworkImage { ${ImageFields} }
        artworklink {
          target
          title
          url
        }
        city
        coordinates
        country
        dcsFlags { ${ImageFields} }
        dcsPhoto { ${ImageFields} }
        dcsPhotoTitle
        dcsRaw { ${ImageFields} }
        dcsSatellite { ${ImageFields} }
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
        orientation
        performance
        population
        proportion
        series
        size
        slug
        style
        width
        units
        year
        artworkImage2 { ${ImageFields} }
        artworkImage3 { ${ImageFields} }
        artworkImage4 { ${ImageFields} }
        artworkImage5 { ${ImageFields} }
        artworkImage6 { ${ImageFields} }
        artworkImage7 { ${ImageFields} }
        artworkImage8 { ${ImageFields} }
        artworkImage9 { ${ImageFields} }
        hasMoreImages
        video {
          node {
            altText
            mediaDetails {
              height
              width
            }
            sourceUrl(size: LARGE)
            uri
          }
        }
        videoPoster { ${ImageFields} }
        videoYouttubeLink
      }
      date
      dateGmt
      databaseId
      colorfulFields {
        storyEn
        wikiLinkEn
        ar
      }
    }
  }
`;