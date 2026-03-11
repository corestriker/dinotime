export interface Taxon {
  name:       string
  start:      number
  end:        number
  rank:       'genus' | 'species'
  group:      'Dinosauria' | 'Reptilia'
  wiki:       string
  hasWiki:    boolean
  imageUrl:   string | null
  isPhylopic: boolean
  locations:  [number, number][]  // Array von [lat, lng] Paaren
}


export interface WikiData {
    hasArticle: boolean
    imageUrl: string | null
    isPhylopic: boolean
}

export interface RangeValue {
    from:   number
    to:     number
}