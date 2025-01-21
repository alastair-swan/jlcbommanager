export type BOMPart = {
    partnumber: String|undefined,
    value: String|undefined,
    JLC: String|undefined,
    items: Array<BOMItem|Array<BOMItem>>
}

export type BOMItem = {
    x: number,
    y: number,
    rotation: number,
    layer: "Top"|"Bottom"|undefined
}
