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

export const getAllArtworkTest = `
  query getAllArtwork {
    allArtwork(first: 500) {
      nodes {
          slug
      }
    }
  }
`

export const getAllArtworkThree = `
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
                        # FIX: Assuming the image object is nested under 'mediaItem'
                        mediaItem { 
                            sourceUrl
                            mediaDetails {
                                sizes(include: [MEDIUM, LARGE, THUMBNAIL]) {
                                    sourceUrl
                                    height
                                    width
                                }
                                width
                                height
                            }
                        }
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
            }
        }
        
        allBiography: pages(where: {title: "Biography"}) { 
            nodes {
                content(format: RENDERED)
            }
        }
        
        cvinfos {
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
        
        artistInfo: artistInfo(id: "cG9zdDozNQ==") {
          artistData { 
            birthcity
            birthyear
            link1 {
              title
              url
            }
            link2 {
              title
              url
            }
            link3 {
              title
              url
            }
            link4 {
              title
              url
            }
            link5 {
              title
              url
            }
            name
            workcity1
            workcity2
            workcity3
          }
        }
    }
`;

export const getAllArtistInfo = `
cvinfos(first:1000) {
          nodes {
            cv_info_fields {
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
        artistInfo(id: "cG9zdDozNQ==") {
          artistInfo {
            birthcity
            birthyear
            link1 {
              title
              url
            }
            link2 {
              title
              url
            }
            link3 {
              title
              url
            }
            link4 {
              title
              url
            }
            link5 {
              title
              url
            }
            name
            workcity1
            workcity2
            workcity3
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
          altText
          mediaDetails {
            width
            height
          }
          srcSet(size: LARGE)
          sourceUrl(size: LARGE)
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