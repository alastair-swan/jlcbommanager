import { Dispatch, SetStateAction, useState } from "react"
import { BOMItem, BOMPart } from "./bomtypes"
import { parseFusionCSV } from "./parsers/fusioncsv"
import Image from "next/image"

export default function BOM(){

    return <div>
        <Load />
    </div>
}

function DataField ({value = "", defaultValue, setValue, style = {}, children}: {value: string, defaultValue: string, setValue: (newvalue: string) => void, style?: Object, children?: React.ReactNode}){
    return <div>
        <input type="text" value={value} style={style} onChange={(e) => {setValue(e.target.value)}}/>{children}
        {
            <button style={{border: 0, paddingLeft: 2, visibility: value === defaultValue ? "hidden" : undefined}} disabled={value === defaultValue} onClick={()=>{setValue(defaultValue)}}><Image src="reverticon.svg" width='15' height='15' alt=""/></button>
        }
    </div>
}

function LayerSelector ({value = "Top", defaultValue = "Top", setValue, style = {}, children}: {value: "Top"|"Bottom", defaultValue: "Top"|"Bottom", setValue: (newvalue: "Top"|"Bottom") => void, style?: Object, children?: React.ReactNode}){
    return <div>
        <select name="Layer" value={value} onChange={(e) => setValue(e.target.value === "Bottom" ? "Bottom" : "Top")} style={style}>
            <option value="Top">Top</option>
            <option value="Bottom">Bottom</option>
        </select>
        {children}
        {
            <button style={{border: 0, paddingLeft: 2, visibility: value === defaultValue ? "hidden" : undefined}} disabled={value === defaultValue} onClick={()=>{setValue(defaultValue)}}><Image src="reverticon.svg" width='15' height='15' alt=""/></button>
        }
    </div>
}

function Load (){
    const [bom, setBom] = useState<Array<BOMPart>>()

    return <div style={{display: 'grid', gap: '20px', columnCount: 3}}>
        <div style={{gridColumnStart: 1, gridColumnEnd: 4}}><LoadBOM bom={bom} setBom={setBom}/></div>
        <div style={{gridColumn: 1}}><BOMInputTable bom={bom} setBom={setBom}/></div>
        <div style={{gridColumn: 2}}><BOMOutput bom={bom} /></div>
        <div style={{gridColumn: 3}}><CPLOutput bom={bom} /></div>
    </div>
}

function BOMInputTable({bom, setBom}: {bom: BOMPart[] | undefined, setBom: Dispatch<SetStateAction<BOMPart[] | undefined>>}){

    if (bom === undefined)
        return ""

    return <table>
        <thead>
            <tr>
                <th>
                    Value
                </th>
                <th>
                    Part
                </th>
                <th>
                    Package
                </th>
                <th>
                    JLCPCB Part #
                </th>
                <th>
                    Part List
                </th>
            </tr>
        </thead>
        <tbody>
            {
                bom.map((d, i) => {
                    //console.log(d.items.value)
                    return <tr key={i}>
                        <td>
                            <DataField value={d.value.value} defaultValue={d.value.default} setValue={(newvalue: string) => {const newbom = [...bom]; newbom[i].value.value = newvalue; setBom(newbom)}}/>
                        </td>
                        <td>
                            <DataField value={d.partnumber.value} defaultValue={d.partnumber.default} setValue={(newvalue: string) => {const newbom = [...bom]; newbom[i].partnumber.value = newvalue; setBom(newbom)}} />
                        </td>
                        <td>
                            <DataField value={d.package.value} defaultValue={d.package.default} setValue={(newvalue: string) => {const newbom = [...bom]; newbom[i].package.value = newvalue; setBom(newbom)}} />
                        </td>
                        <td>
                            <DataField value={d.JLC.value} defaultValue={d.JLC.default} setValue={(newvalue: string) => {const newbom = [...bom]; newbom[i].JLC.value = newvalue; setBom(newbom)}} />
                        </td>
                        <td>
                        {
                            d.items.value.map((d1: BOMItem|Array<BOMItem>, i1) => {
                                if (Array.isArray(d1)){
                                    d1.map((d2, i2) => {
                                        return <span key={i2} className="tooltip">{d2.id}, <span className="tooltiptext"></span></span>
                                    })
                                }
                                else{
                                    return (
                                    <span key={i1} className="tooltip" style={{paddingLeft: "2px", paddingRight: "2px"}}>
                                        { 
                                            d1.hasPNP ? <span>{d1.id}</span> :
                                            <span color="yellow">{d1.id}</span> 
                                        }
                                        <span className="tooltiptext">
                                            x: {d1.x.value}mm<br/>
                                            y: {d1.y.value}mm<br/>
                                            <LayerSelector value={d1.layer.value === undefined ? "Top" : d1.layer.value} defaultValue={d1.layer.default === undefined ? "Top" : d1.layer.default} setValue={(newvalue: "Top"|"Bottom") => {const newbom = [...bom]; newbom[i].items.value[i1].layer.value = newvalue; setBom(newbom)}} style={{ maxWidth: "80px"}}></LayerSelector>
                                            <DataField value={d.items.value[i1].rotation.value} defaultValue={d.items.value[i1].rotation.default} setValue={(newvalue: string) => {const newbom = [...bom]; newbom[i].items.value[i1].rotation.value = newvalue; setBom(newbom)}} style={{ maxWidth: "60px"}}>°</DataField>
                                        </span>
                                        { i1 != d.items.value.length - 1 ? ", " : ""}
                                    </span>
                            )}
                            })
                        }
                        </td>
                    </tr>
                })
            }
        </tbody>
    </table>
}

function download(filename: string, text: string) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
}

function countMaxLines (bom: BOMPart[] | undefined): number{
    if (bom === undefined)
        return 2
    var count = 2
    bom.map((d, i) => {
        count = count + d.items.value.length
    })
    return count
}

function BOMOutput({bom}: {bom: BOMPart[] | undefined}){
    var BOMCSV = "This is the output BOM"
    if (bom != undefined){
        BOMCSV = 'Comment,Designator,Footprint,JLCPCB Part #\n'
        bom.map((d, i) => {
            BOMCSV = BOMCSV.concat(d.value.value).concat(', ')
            if (d.items.value.length > 1)
                BOMCSV = BOMCSV.concat('"')
            d.items.value.map((d1, i1) => {
                BOMCSV = BOMCSV.concat(d1.id).concat((i1 < d.items.value.length - 1) ? ", ": "")
            })
            if (d.items.value.length > 1)
                BOMCSV = BOMCSV.concat('"')
            BOMCSV = BOMCSV.concat(', ')
            BOMCSV = BOMCSV.concat(bom[i].package.value).concat(", ")
            BOMCSV = BOMCSV.concat(bom[i].JLC.value).concat("\n")
        })
    }
    return <div style={{display: "grid", columnCount: 1}}>
        <div style={{gridColumn: 1}}>
        <textarea aria-multiline style={{width: "100%"}} readOnly value={BOMCSV} cols={50} rows={countMaxLines(bom)} wrap="off"/>
        </div>
        <div style={{gridColumn: 1}}>
        <button style={{width: "100%"}} onClick={() => {
                    download("BOM.csv", BOMCSV)
                }}>Download</button>
        </div>
    </div>
}
  

function CPLOutput({bom}: {bom: BOMPart[] | undefined}){

    var CPLCSV = "This is the output CPL"
    if (bom != undefined){
        CPLCSV = "Designator, Mid X, Mid Y, Layer, Rotation\n"
        bom.map((d, i) => {
            d.items.value.map((d1, i1) =>{
                CPLCSV = CPLCSV.concat(d1.id).concat(", ").concat(d1.x.value).concat(", ").concat(d1.y.value).concat(", ").concat(d1.layer.value === "Bottom" ? "Bottom" : "Top").concat(", ").concat(d1.rotation.value).concat("\n")
            })
        })
    }
    return <div style={{display: "grid", columnCount: 1}}>
            <div style={{gridColumn: 1}}>
                <textarea style={{width: "100%"}} readOnly value={CPLCSV} cols={50} rows={countMaxLines(bom)} wrap="off"/>
            </div>
            <div style={{gridColumn: 1}}>
                <button style={{width: "100%"}} onClick={() => {
                    download("CPL.csv", CPLCSV)
                }}>Download</button>
            </div>
        </div>
}

function LoadBOM({bom, setBom}: {bom: BOMPart[] | undefined, setBom: Dispatch<SetStateAction<BOMPart[] | undefined>>}){

    const [bomcontents, setBOMContents] = useState<string>("")
    const [pnpfront, setPnPFront] = useState<{data: string,enabled: boolean}>({data: "", enabled: true})
    const [pnpback, setPnPBack] = useState<{data: string,enabled: boolean}>({data: "", enabled: true})

    const handleLoadButtonClick = () => {
        setBom(parseFusionCSV(bomcontents, pnpfront.enabled ? pnpfront.data : "", pnpback.enabled ? pnpback.data : ""))
    }

    return (
        <div style={{display: 'grid', gap: '20px', columnCount: 3}}>
            <div style={{gridColumn: 1}}>
                <div>BOM</div>
                <div>
                    <input 
                        type="file" 
                        name="BOM" 
                        accept="text/csv" //,text/plain"
                        onChange={e => {
                            const files = e.target.files
                            if (files != null){
                                if (files[0] != undefined){
                                    if (files[0].type === 'text/csv'){ //files[0].type === 'text/plain' || 
                                        files[0].text().then((value:string) => {
                                            setBOMContents(value)
                                        })
                                    }
                                }
                            }
                        }}
                    />
                </div>
            </div>
            <div style={{gridColumn: 2}}>
            <div>Front PnP</div>
                <div>
                    <input 
                        type="file" 
                        name="PnPFront" 
                        accept="text/csv" //,text/plain"
                        onChange={e => {
                            const files = e.target.files
                            if (files != null){
                                if (files[0] != undefined){
                                    if (files[0].type === 'text/csv'){ // files[0].type === 'text/plain' || 
                                        files[0].text().then((value:string) => {setPnPFront(old => ({data: value, enabled: old.enabled}))})
                                        }
                                    }
                                }
                            }
                        }
                    />
                </div>
                <div>
                    <input checked={pnpfront.enabled} onChange={(e) => {setPnPFront(old => ({data: old === undefined ? "" : old.data, enabled: e.target.checked}))}} type="checkbox"/>
                    { pnpfront.enabled ? pnpfront.data === "" ? "No Front PNP Loaded" : "Front PNP Loaded" : "Front PNP Skipped"}
                </div>
            </div>
            <div style={{gridColumn: 3}}>
                <div>Back PnP</div>
                <div>
                    <input 
                        type="file" 
                        name="PnPBack" 
                        accept="text/csv" //,text/plain"
                        onChange={e => {
                            const files = e.target.files
                            if (files != null){
                                if (files[0] != undefined){
                                    if (files[0].type === 'text/csv'){ //files[0].type === 'text/plain' || 
                                        files[0].text().then((value:string) => {setPnPBack(old => ({data: value, enabled: old.enabled}))})
                                        }
                                    }
                                }
                            }
                        }
                    />
                </div>
                <div>
                    <input checked={pnpback.enabled} onChange={(e) => {setPnPBack(old => ({data: old === undefined ? "" : old.data, enabled: e.target.checked}))}} type="checkbox"/>
                    {pnpback === undefined ? "No Back PNP Loaded"  : pnpback.enabled ? pnpback.data === "" ? "No Back PNP Loaded" : "Back PNP Loaded" : "Back PNP Skipped"}
                </div>
            </div>
            <div style={{gridColumnStart: 1, gridColumnEnd: 4, display: 'flex', justifyContent: "center", alignItems: 'center'}}>
                <button style={{padding: '10px'}} disabled={bomcontents === "" || (pnpfront.enabled && pnpfront.data === "") || (pnpback.enabled && pnpback.data === "") || (!pnpfront.enabled && !pnpback.enabled)} onClick={handleLoadButtonClick}>
                    {
                        bomcontents === "" ? "A BOM file is required" :
                        ((!pnpfront.enabled || pnpfront.data === "") && (!pnpback.enabled || pnpback.data === "")) ? "At least one PnP file is required" :
                        "Parse Files"
                    }
                </button>
            </div>
        </div>
    )
}