export const getAllArtwork = `
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
        page(id: "cG9zdDo1MQ==") {
          content(format: RENDERED)
        }
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
    }
`

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

export const singleArtwork = `
  query
`