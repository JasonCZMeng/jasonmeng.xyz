export interface SocialLink {
  label: string
  url: string
  icon: string
}

export interface Experience {
  company: string
  role: string
  period: string
  startYear: number
  endYear: number | null
  description: string
  tags: string[]
}

export interface Investment {
  company: string
  url: string
  category: string[]
  stage: string
}

export interface WritingEntry {
  type: 'tweet' | 'article'
  title: string
  excerpt: string
  url: string
  date: string
  platform: 'x' | 'medium' | 'other'
}

export interface Section {
  id: string
  label: string
}
