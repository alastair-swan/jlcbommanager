export type BOMPart = {
    partnumber: string|undefined,
    value: string|undefined,
    JLC: string|undefined,
    items: Array<BOMItem|Array<BOMItem>>
}

export type BOMItem = {
    identifier: string,
    x: number,
    y: number,
    rotation: number,
    layer: "Top"|"Bottom"|undefined
}
