export type BOMPart = {
    id: number,
    partnumber: {value: string, default: string},
    package: {value: string, default: string},
    value: {value: string, default: string},
    JLC: {value: string, default: string},
    items: {value: Array<BOMItem>, default: Array<BOMItem>} 
}

export type BOMPartKey = "partnumber"|"package"|"value"|"JLC"

export type BOMItem = {
    id: string,
    x: {value: string, default: string},
    y: {value: string, default: string},
    rotation: {value: string, default: string},
    layer: {value: "Top"|"Bottom"|undefined, default: "Top"|"Bottom"|undefined}
    hasPNP: boolean
    inUse?: boolean
}

export type BOMItemKey = "x"|"y"|"rotation"|"layer"

export type BOMReference = {index: number, key: BOMPartKey, itemid?: undefined} | {index: number, key: "items", itemid: {index: number, key: BOMItemKey}}