export interface DistanceMatrixDto {
    destination_addresses: string[]
    origin_addresses: string[]
    rows: Row[]
    status: string
  }
  
  export interface Row {
    elements: Element[]
  }
  
  export interface Element {
    distance: Distance
    duration: Duration
    origin: string
    destination: string
    status: string
  }
  
  export interface Distance {
    text: string
    value: number
  }
  
  export interface Duration {
    text: string
    value: number
  }

export class FarmData {
  origin: string;
  destination: string;

}