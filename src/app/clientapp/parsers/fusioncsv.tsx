import { BOMPart, BOMItem } from "../bomtypes"


export function parseFusionCSV(bomfile: string, pnpfront: string, pnpback: string, pnpheaders: true|Array<string> = ["identifier", "x", "y", "rotation", "value", "partnumber"]): Array<BOMPart>{
    const bomdata = CSVToArray(bomfile)
    const pnpf = CSVToArray(pnpfront, pnpheaders)
    const pnpb = CSVToArray(pnpback, pnpheaders)

    const pnp: Array<BOMItem> = []
    const bom: Array<BOMPart> = []

    for (var frontpnpindex = 0; frontpnpindex < pnpf.length; frontpnpindex++){
        pnp.push(
            {
                id: pnpf[frontpnpindex].identifier,
                x: pnpf[frontpnpindex].x,
                y: pnpf[frontpnpindex].y,
                rotation: pnpf[frontpnpindex].rotation,
                layer: pnpf[frontpnpindex].layer != undefined ? pnpf[frontpnpindex].layer : "top"
            }
        )
    }
    for (var backpnpindex = 0; backpnpindex < pnpb.length; backpnpindex++){
        pnp.push(
            {
                id: pnpb[backpnpindex].identifier,
                x: pnpb[backpnpindex].x,
                y: pnpb[backpnpindex].y,
                rotation: pnpb[backpnpindex].rotation,
                layer: pnpb[backpnpindex].layer != undefined ? pnpb[backpnpindex].layer : "back"
            }
        )
    }

    for (var bomindex = 0; bomindex < bomdata.length; bomindex++){
        const pn = bomdata[bomindex].Device != undefined ? bomdata[bomindex].Device : bomdata[bomindex].Footprint
        const pac = bomdata[bomindex].Package
        const val = bomdata[bomindex].Value != undefined ? bomdata[bomindex].Value : bomdata[bomindex].Comment
        const JLC = bomdata[bomindex]["JLCPCB Part #"]
        var itemlist = bomdata[bomindex].Parts != undefined ? bomdata[bomindex].Parts : bomdata[bomindex].Designator
        const items: Array<BOMItem> = []
        console.log(itemlist)
        if (typeof(itemlist) === 'string'){
            itemlist = [itemlist]
        }
        for (var i = 0; i < itemlist.length; i++){
            for (var j = 0; j < pnp.length; j++){
                if (itemlist[i] === pnp[j].id){
                    items.push(pnp[j])
                    continue
                }
            }
        }
        
        bom.push({
            id: bomindex,
            partnumber: pn,
            package: pac,
            value: val,
            JLC: JLC,
            items: items
        })
    }

    console.log(bom)

    return bom
}

function CSVToArray(csvstring: string, headers: true|Array<string> = true): Array<any>{
    const lines = csvstring.split('\n')
    if (lines === undefined)
    {   
        throw new Error("Invalid BOM file, expected CSV file")
    } 

    var tempheader: Array<string>
    if (typeof(headers) === "boolean")
        tempheader = CSVHeaderToArray(lines[0])
    else
        tempheader = headers
    const header = tempheader
    const datalines: Array<CSVItem> = []
    {
        const data = headers === true ? lines.slice(1) : lines

        for (var i = 0; i < data.length; i++){
            if (data[i] != "")
                datalines.push(CSVLineToArray(data[i]))
        }
    }
    const data: Array<any> = []
    for (var datarow = 0; datarow < datalines.length; datarow++){    
        var newline = {}
        var datacolumn = 0
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

    var dataitemarray = null
    const maxitems = 100
    while (dataitemarray = pattern.exec(line)){
        var dataitem: string = ""
        for (var i = dataitemarray.length-1; i >= 0; i--){
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
    const pattern = RegExp('(?:(?:"(.*?)"|(.*?))(?:,|$))', 'gy')
    const partlistpatern = RegExp(',')
    const linearray = Array<CSVItem>()

    var dataitemarray = null
    const maxitems = 100
    while ( !(linearray.length >= maxitems || pattern.lastIndex === line.length) && (dataitemarray = pattern.exec(line))){
        var dataitem: CSVItem = ""
        for (var i = dataitemarray.length-1; i >= 0; i--){
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

    return linearray
}