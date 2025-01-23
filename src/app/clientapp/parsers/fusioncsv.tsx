import { BOMPart, BOMItem } from "../bomtypes"


export function parseFusionCSV(bomfile: string, pnpfront: string, pnpback: string, pnpheaders: true|Array<string> = ["identifier", "x", "y", "rotation", "value", "partnumber"]): Array<BOMPart>{
    

    const bomdata = CSVToArray(bomfile)
    const pnpheaderdefault = pnpheaders != true ? [...pnpheaders] : []
    if (pnpfront.startsWith("Designator"))
        pnpheaders = ["Designator","Mid X","Mid Y","Layer","Rotation"]
    else
        pnpheaders = pnpheaderdefault
    const pnpf = CSVToArray(pnpfront, pnpheaders)
    if (pnpback.startsWith("Designator"))
        pnpheaders = ["Designator","Mid X","Mid Y","Layer","Rotation"]
    else
        pnpheaders = pnpheaderdefault
    const pnpb = CSVToArray(pnpback, pnpheaders)

    //console.log(pnpf)

    const pnp: Array<BOMItem> = []
    const bom: Array<BOMPart> = []

    for (let frontpnpindex = 0; frontpnpindex < pnpf.length; frontpnpindex++){
        let l: string
        if (pnpf[frontpnpindex].layer != undefined)
            l = pnpf[frontpnpindex].layer as string
        else if (pnpf[frontpnpindex].Layer != undefined)
            l    = (pnpf[frontpnpindex].Layer != undefined)
        if (l)
            l = "Bottom"
        else
            l = "Top"

        const x: string = (pnpf[frontpnpindex].x != undefined ? pnpf[frontpnpindex].x : pnpf[frontpnpindex]["Mid X"]) as string
        const y: string = (pnpf[frontpnpindex].y != undefined ? pnpf[frontpnpindex].y : pnpf[frontpnpindex]["Mid Y"]) as string
        const r: string = (pnpf[frontpnpindex].rotation != undefined ? pnpf[frontpnpindex].rotation : pnpf[frontpnpindex].Rotation) as string
        //console.log(pnpf[frontpnpindex])
        pnp.push(
            {
                id: (pnpf[frontpnpindex].identifier != undefined ? pnpf[frontpnpindex].identifier : pnpf[frontpnpindex].Designator) as string,
                x: {value: x, default: x},
                y: {value: y, default: y},
                rotation: { value: r, default: r}, 
                layer: {value: l as "Top"|"Bottom", default: l as "Top"|"Bottom"},
                hasPNP: true
            }
        )
    }
    for (let backpnpindex = 0; backpnpindex < pnpb.length; backpnpindex++){

        let l
        if (pnpb[backpnpindex].layer != undefined)
            l = pnpb[backpnpindex].layer
        else if (pnpb[backpnpindex].Layer != undefined)
            l = (pnpb[backpnpindex].Layer != undefined)
        if (l === "Top" || l === "Front")
            l = "Top"
        else
            l = "Bottom"

        const x = (pnpb[backpnpindex].x != undefined ? pnpb[backpnpindex].x : pnpb[backpnpindex]["Mid X"]) as string
        const y = (pnpb[backpnpindex].y != undefined ? pnpb[backpnpindex].y : pnpb[backpnpindex]["Mid Y"]) as string
        const r = (pnpb[backpnpindex].rotation != undefined ? pnpb[backpnpindex].rotation : pnpb[backpnpindex].Rotation) as string
        pnp.push(
            {
                id: (pnpb[backpnpindex].identifier != undefined ? pnpb[backpnpindex].identifier : pnpb[backpnpindex].Designator) as string,
                x: { value: x, default: x },
                y: { value: y, default: y },
                rotation: { value: r, default: r },
                layer: {value: l as "Top"|"Bottom", default: l as "Top"|"Bottom"},
                hasPNP: true
            }
        )
    }

    for (let bomindex = 0; bomindex < bomdata.length; bomindex++){
        const pn = (bomdata[bomindex].Device != undefined ? bomdata[bomindex].Device : bomdata[bomindex].Footprint) as string
        const pac = (bomdata[bomindex].Package != undefined ? bomdata[bomindex].Package : bomdata[bomindex].Footprint) as string
        const val0 = (bomdata[bomindex].Value != undefined ? bomdata[bomindex].Value : bomdata[bomindex].Comment)
        const val = typeof(val0) === "string" ? val0 : '"'.concat(val0.toString()).concat('"')
        const JLC = (bomdata[bomindex]["JLCPCB Part #"] != undefined ? bomdata[bomindex]["JLCPCB Part #"] : "") as string
        let itemlist = bomdata[bomindex].Parts != undefined ? bomdata[bomindex].Parts : bomdata[bomindex].Designator
        const items: Array<BOMItem> = []
        if (typeof(itemlist) === 'string'){
            itemlist = [itemlist]
        }
        for (let i = 0; i < itemlist.length; i++){
            let matchfound = false
            for (let j = 0; j < pnp.length; j++){
                if (itemlist[i] === pnp[j].id){
                    items.push(pnp[j])
                    pnp[j].inUse = true
                    matchfound = true
                    continue
                }
            }
            if (!matchfound){
                items.push({
                    id: itemlist[i],
                    x: {value: "unknown", default: "unknown"},
                    y: {value: "unknown", default: "unknown"},
                    rotation: {value: "unknown", default: "unknown"},
                    layer: {value: undefined, default: undefined},
                    hasPNP: false
                })
            }
        }
        
        bom.push({
            id: bomindex,
            partnumber: {value: pn, default: pn},
            package: {value: pac, default: pac},
            value: {value: val, default: val},
            JLC: {value: JLC, default: JLC},
            items: {value: items, default: items}
        })
    }

    const unusedPNP: BOMItem[] = []
    pnp.map((d) => {
        if (!d.inUse && d.id != "Designator"){
            unusedPNP.push(d)
        }
    })

    if (unusedPNP.length != 0){
        bom.push({
            id: bom.length,
            partnumber: {value: "unknown", default: "unknown"},
            package: {value: "unknown", default: "unknown"},
            value: {value: "unknown", default: "unknown"},
            JLC: {value: "unknown", default: "unknown"},
            items: {value: unusedPNP, default: unusedPNP},
        })
    }

    //console.log(bom)

    return bom
}


function CSVToArray(csvstring: string, headers: true|Array<string> = true): Array<{[key: string]: string|string[]}>{
    const lines = csvstring.split('\n')
    if (lines === undefined)
    {   
        throw new Error("Invalid BOM file, expected CSV file")
    } 

    let tempheader: Array<string>
    if (typeof(headers) === "boolean")
        tempheader = CSVHeaderToArray(lines[0])
    else
        tempheader = headers
    const header = tempheader
    //console.log(header)
    const datalines: Array<CSVItem> = []
    {
        const data = headers === true ? lines.slice(1) : lines

        for (let i = 0; i < data.length; i++){
            if (data[i] != "")
                datalines.push(CSVLineToArray(data[i]))
        }
    }
    const data: Array<{[key: string]: string|string[]}> = []
    for (let datarow = 0; datarow < datalines.length; datarow++){    
        let newline = {}
        let datacolumn = 0
        while (header[datacolumn] != undefined && datalines[datarow][datacolumn] != undefined){
            const headeritem = header[datacolumn]
            newline = {
                ...newline, 
                [headeritem]: datalines[datarow][datacolumn]
            }
            datacolumn++
        }
        data.push(newline)
    }
    return data
}

type CSVItem = string|Array<string|Array<CSVItem>>

function CSVHeaderToArray(line: string): Array<string>{
    const pattern = RegExp('(?:(?:"(.*?)"|(.*?))(?:,|$))', 'gy')
    const linearray = Array<string>()

    let dataitemarray = null
    const maxitems = 100
    while (dataitemarray = pattern.exec(line)){
        let dataitem: string = ""
        for (let i = dataitemarray.length-1; i >= 0; i--){
            if (dataitemarray[i] != undefined){
                dataitem = dataitemarray[i] 
                break
            }
        }
        
        linearray.push(dataitem)
        if (linearray.length >= maxitems)
            break
    }

    return linearray
}

function CSVLineToArray(line: string): CSVItem{
    const pattern = RegExp('(?:(?:"(.*?)"|(.*?))(?:,|$|\\r))', 'gy')
    const partlistpatern = RegExp(',')
    const linearray = Array<CSVItem>()

    let dataitemarray = null
    const maxitems = 200
    while ( !(linearray.length >= maxitems || pattern.lastIndex === line.length) && (dataitemarray = pattern.exec(line))){
        let dataitem: CSVItem = ""
        for (let i = dataitemarray.length-1; i >= 0; i--){
            if (dataitemarray[i] != undefined){
                dataitem = dataitemarray[i].trim()
                //console.log(dataitem)
                break
            }
        }
        if (partlistpatern.test(dataitem)){
            //console.log(dataitem)
            dataitem = CSVLineToArray(dataitem)
            //console.log(dataitem)
        }
        linearray.push(dataitem)
    }
    //console.log(linearray)
    //console.log(line)
    //console.log(line.split(","))
    return linearray
}