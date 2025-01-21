import { Suspense, useState } from "react"
import { BOMItem, BOMPart } from "./bomtypes"

export default function BOM(){
    let BOMlist: Array<BOMItem>

    return <div>
        <Load />
    </div>
}

function Load (){
    return <div>
        <LoadBOM /><br />
        <button>Load PnP</button>
    </div>
}

function LoadBOM(){
    const [state, setState] = useState(0)
    const [filecontents, setFileContents] = useState<string>("")
    function buttonText(){
        if (state == 0)
            return "Load BOM"
        if (state == 1)
            return "Replace BOM"
        if (state == 2)
            return "Invalid File"
    }

    return (
        <div>
            { buttonText() }
            <br />
            <input 
                type="file" 
                name="BOM" 
                accept="text/csv,text/plain"
                onChange={e => {
                    const files = e.target.files
                    if (files != null){
                        if (files[0] != undefined){
                            console.log(files[0].type)
                            if (files[0].type === 'text/plain' || files[0].type === 'text/csv'){
                                files[0].text().then((value:string) => {
                                    setFileContents(value)
                                })
                                setState(1)
                                
                            }
                            else{
                                setState(2)
                            }
                        }
                    }
                }}
            />
            <p>
                { filecontents }
            </p>
        </div>
    )
}