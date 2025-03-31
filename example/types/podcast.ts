export interface PodcastSearchResult {
  artistName: string
  artworkUrl100: string
  artworkUrl30: string
  artworkUrl60: string
  artworkUrl600: string
  collectionCensoredName: string
  collectionExplicitness: "notExplicit" | "explicit"
  collectionHdPrice: number
  collectionId: number
  collectionName: string
  collectionPrice: number
  collectionViewUrl: string
  contentAdvisoryRating: "Clean" | "Explicit"
  country: string
  currency: string
  description?: string
  feedUrl: string
  genreIds: string[]
  genres: string[]
  kind: "podcast"
  primaryGenreName: string
  releaseDate: string
  trackCensoredName: string
  trackCount: number
  trackExplicitness: "cleaned" | "explicit"
  trackId: number
  trackName: string
  trackPrice: number
  trackTimeMillis: number
  trackViewUrl: string
  wrapperType: "track"
}

export interface PodcastSearchResponse {
  resultCount: number
  results: PodcastSearchResult[]
}

export interface SearchResult {
  id: string
  title: string
  author: string
  description: string
  artworkUrl100?: string
}
