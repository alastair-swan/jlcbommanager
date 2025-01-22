export type BOMPart = {
    id: number,
    partnumber: string|undefined,
    package: string|undefined,
    value: string|undefined,
    JLC: string|undefined,
    items: Array<BOMItem>
}

export type BOMPartKey = "partnumber"|"package"|"value"|"JLC"

export type BOMItem = {
    id: string,
    x: string,
    y: string,
    rotation: string,
    layer: "Top"|"Bottom"|undefined
}

export type BOMItemKey = "x"|"y"|"rotation"|"layer"

export type BOMReference = {index: number, key: BOMPartKey, itemid?: undefined} | {index: number, key: "items", itemid: {index: number, key: BOMItemKey}}