type TPrintRow = {
  type: 'Divider',
  value: '-' | '+' | '='
} | {
  type: 'Image' | 'Barcode' | 'QR',
  value: string
} | {
  type: 'Text'
  value: string
  align?: 0 | 1 | 2 | 3 // 0 = default | 1 = center | 2 = left | 3 = right
  size?: 15 | 20 | 25 | 30 | 35 // 20 = default
}

export type TPrintData = Array<TPrintRow>
