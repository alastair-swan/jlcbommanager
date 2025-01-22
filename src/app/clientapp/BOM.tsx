import { useState } from "react"
import { BOMItem, BOMPart } from "./bomtypes"
import { parseFusionCSV } from "./parsers/fusioncsv"
import Image from "next/image"

export default function BOM(){

    return <div>
        <Load />
    </div>
}

function Load (){
    return <div>
        <LoadBOM /><br />
    </div>
}

function LoadBOM(){
    const [bom, setBom] = useState<Array<BOMPart>>()
    const [bomcontents, setBOMContents] = useState<string>("")
    const [pnpfront, setPnPFront] = useState<string>("")
    const [pnpback, setPnPBack] = useState<string>("")

    const handleLoadButtonClick = () => {
        setBom(parseFusionCSV(bomcontents, pnpfront, pnpback))
    }

    function DataField ({defaultValue = "", style = {}, children}: {defaultValue: string, style?: Object, children?: React.ReactNode}){
        const [value, setValue] = useState(defaultValue)
        return <div>
            <input type="text" value={value} style={style} onChange={(e) => {setValue(e.target.value)}}/>{children}
            {
                <button style={{border: 0, paddingLeft: 2, visibility: value === defaultValue ? "hidden" : undefined}} disabled={value === defaultValue} onClick={()=>{setValue(defaultValue)}}><Image src="reverticon.svg" width='15' height='15' alt=""/></button>
            }
        </div>
    }

    function LayerSelector ({defaultValue = "Top", style = {}, children}: {defaultValue: "Top"|"Bottom", style?: Object, children?: React.ReactNode}){
        const [value, setValue] = useState(defaultValue as string)
        return <div>
            <select name="Layer" value={value} onChange={(e) => setValue(e.target.value)} style={style}>
                <option value="Top">Top</option>
                <option value="Bottom">Bottom</option>
            </select>
            {children}
            {
                <button style={{border: 0, paddingLeft: 2, visibility: value === defaultValue ? "hidden" : undefined}} disabled={value === defaultValue} onClick={()=>{setValue(defaultValue)}}><Image src="reverticon.svg" width='15' height='15' alt=""/></button>
            }
        </div>
    }

    function BOMTable(){
        if (bom === undefined){
            return ""
        }
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
                        //console.log(d.items)
                        return <tr key={i}>
                            <td>
                                <DataField defaultValue={d.value === undefined ? "" : d.value} />
                            </td>
                            <td>
                                <DataField defaultValue={d.partnumber === undefined ? "" : d.partnumber} />
                            </td>
                            <td>
                                <DataField defaultValue={d.package === undefined ? "" : d.package} />
                            </td>
                            <td>
                                <DataField defaultValue={d.JLC === undefined ? "" : d.JLC} />
                            </td>
                            <td>
                            {
                                d.items.map((d1: BOMItem|Array<BOMItem>, i1) => {
                                    if (Array.isArray(d1)){
                                        d1.map((d2, i2) => {
                                            return <span key={i2} className="tooltip">{d2.id}, <span className="tooltiptext"></span></span>
                                        })
                                    }
                                    else{
                                        return (
                                        <span key={i1} className="tooltip" style={{paddingLeft: "2px", paddingRight: "2px"}}>
                                            { d1.id }
                                            <span className="tooltiptext">
                                                x: {d1.x}mm<br/>
                                                y: {d1.y}mm<br/>
                                                <LayerSelector defaultValue={d1.layer === undefined ? "Top" : d1.layer} style={{ maxWidth: "80px"}}></LayerSelector>
                                                <DataField defaultValue={d1.rotation.toString()} style={{ maxWidth: "60px"}}>°</DataField>
                                            </span>
                                            { i1 != d.items.length - 1 ? ", " : ""}
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

    return (
        <div style={{display: 'grid', gap: '20px', columnCount: 3}}>
            <div style={{gridColumn: 1}}>
                <div>BOM</div>
                <div>
                    <input 
                        type="file" 
                        name="BOM" 
                        accept="text/csv,text/plain"
                        onChange={e => {
                            const files = e.target.files
                            if (files != null){
                                if (files[0] != undefined){
                                    if (files[0].type === 'text/plain' || files[0].type === 'text/csv'){
                                        files[0].text().then((value:string) => {
                                            setBOMContents(value)
                                        })
                                    }
                                }
                            }
                        }}
                    />
                </div>
                <div>
                    {
                        bomcontents === "" ? "BOM not yet loaded" : "BOM loaded"
                    }
                </div>
            </div>
            <div style={{gridColumn: 2}}>
                <div>Front PnP</div>
                <div>
                    <input 
                        type="file" 
                        name="PnPFront" 
                        accept="text/csv,text/plain"
                        onChange={e => {
                            const files = e.target.files
                            if (files != null){
                                if (files[0] != undefined){
                                    if (files[0].type === 'text/plain' || files[0].type === 'text/csv'){
                                        files[0].text().then((value:string) => {
                                            setPnPFront(value)
                                        })
                                    }
                                }
                            }
                        }}
                    />
                </div>
                <div>
                    {
                        pnpfront === "" ? "Front PnP not yet loaded" : "Front PnP Loaded"
                    }
                </div>
            </div>
            <div style={{gridColumn: 3}}>
                <div>Back PnP</div>
                <div>
                    <input 
                        type="file" 
                        name="PnPBack" 
                        accept="text/csv,text/plain"
                        onChange={e => {
                            const files = e.target.files
                            if (files != null){
                                if (files[0] != undefined){
                                    if (files[0].type === 'text/plain' || files[0].type === 'text/csv'){
                                        files[0].text().then((value:string) => {
                                            setPnPBack(value)
                                        })
                                    }
                                }
                            }
                        }}
                    />
                </div>
                <div>
                    {
                        pnpback === "" ? "Back PnP not yet loaded" : "Backside PnP Loaded"
                    }
                </div>
            </div>
            <div style={{gridColumnStart: 1, gridColumnEnd: 4, display: 'flex', justifyContent: "center", alignItems: 'center'}}>
                <button style={{padding: '10px'}} onClick={handleLoadButtonClick}>Load PnP</button>
            </div>
            <div style={{gridColumnStart: 1, gridColumnEnd: 4, display: 'flex', justifyContent: "center", alignItems: 'center'}}>
                { BOMTable() }
            </div>
        </div>
    )
}