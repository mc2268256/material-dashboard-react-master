import React, { useState,useEffect, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import * as echarts from 'echarts';
import { use } from 'echarts';


//论文作者之间合作关系

const crerateGraph = (paperList) => {//作者之间有过论文合作 即同一篇论文作者s 则存在边
    let autherPapers = {}//作者的paper  autherPapers["jack"] = [156,258,372,...]
    paperList.forEach((paper,index) => {
        paper["AuthorNames-Deduped"].forEach( name => {
            if(autherPapers[name] === undefined){
                autherPapers[name] = [index]
            }else{
                autherPapers[name].push(index)
            }
        } )
    })
    
    let nodes  = Object.keys(autherPapers)
    let edgeSet = new Set()
    let edges = []
    nodes.forEach( (currentName,currentIndex) => {
        const a = autherPapers[currentName]
        nodes.forEach( (name,index) => {
            if( currentIndex < index){
                const b = autherPapers[name]
                for( let _a of a){
                    for( let _b of b){
                        if( _a === _b){
                            edgeSet.add(  `${currentIndex}-${index}`  )
                            break
                        }
                    }
                }
            }
        })    
    })
    edgeSet.forEach( edge => {
        edges.push(edge.split("-"))
    } )
    return {
        nodes:nodes,// [name_1,name_2,......]
        edges:edges,//  [  [学者姓名index_1  -> 学者姓名index_2]  , ...]
        autherPapers:autherPapers,//  作者 -> [paper_1_index,paper_2_index,...] 
        paperMap:paperList//   paperindex -> {title:...,doi:...,...}
    }
}


const academicAge = (graph) =>{ //学术年龄，一名学者发表论文最近一年时间减去最晚一年时间
    const result = {}
    graph.nodes.forEach(   (name)  => {
        const papers = graph.autherPapers[name]
        let min = 665536;
        let max = 0;
        papers.forEach( (index) => {
            const year = Number(graph.paperMap[index].Year)
            min = Math.min(min,year)
            max = Math.max(max,year)
        }  )
        result[name] = max-min
    })
    return result;
}



const degreeCentrality = (graph) =>{ //度中心性，指在自中心网络中学者的邻居个数

    const result = {};

    graph.nodes.forEach( (name) => {
        result[name] = 0
    })

    graph.edges.forEach(    (edge) => {
        result[ graph.nodes[Number(edge[0])]] += 1
        result[ graph.nodes[Number(edge[1])]] += 1
        }  
    )  
    return result;

}

const neighborConnectivity = (graph,DC) => { //均值近邻度，指的是目标学者邻居的平均度数
    const result = {}
    graph.nodes.forEach(  (name) => {
        result[name] = 0
    })
    
    graph.edges.forEach( (edge) => {
        result[ graph.nodes[Number(edge[0])]] +=   DC[graph.nodes[Number(edge[1])]]
        result[ graph.nodes[Number(edge[1])]] +=   DC[graph.nodes[Number(edge[0])]]
        }  
    ) 

    graph.nodes.forEach(  (name) => {
        result[name] =   DC[name] === 0 ? 0 : result[name] / DC[name]
    }) 

    return result

}




export default function Ncmode(props){
    const UID ="w9378rgfyu3w587tgafgw0837gdsfsdfaa9p8h49wibib[8ro3ay8wraw[rohga[5ryi"
    
    const visualConfig = {
        maxSymbolSize:10,
        maxEdgeWidth:10,
        seriesNum:8
    }

    const initOption = ( data ) => {
            var chartDom = document.getElementById(UID);
            var myChart = echarts.init(chartDom);
            myChart.clear()
            
            let links = []
            
            let nodes = []
            
            let nodeSize = {}
            let maxNode = 1
            
            const degreeData = degreeCentrality(data)
            const ageData = academicAge(data)
            const ncData = neighborConnectivity(data,degreeData)



            let minAge = 65536
            let maxAge = 0

            data.nodes.forEach(  (name) => {
                minAge = Math.min(ageData[name],minAge)
                maxAge = Math.max(ageData[name],maxAge)
            })
            
            // console.log(`mini = ${minAge} , max =  ${maxAge}`)
            const axis = [  ]
            
            const values = {}
            const ncvalues = {}
            for(let i =  minAge ; i <= maxAge ; i++ ){
                axis.push(i)
                values[i] = [0,0]    
                ncvalues[i] = [0,0]       
            }

            
            data.nodes.forEach(  (name) => {
                values[ageData[name]][0] += 1
                values[ageData[name]][1] += degreeData[name]

                ncvalues[ageData[name]][0] += 1
                ncvalues[ageData[name]][1] += ncData[name]
            })
            
            
            const average = []
            const ncxis = []
            for(let i =  minAge ; i <= maxAge ; i++ ){
                console.log(i,values[i])
                average.push( values[i][1] / values[i][0] )     
                ncxis.push(ncvalues[i][1] / ncvalues[i][0])    
            }
            // console.log(ncvalues)
    





            const option = {

                title: {
                    text: '基于学术年龄的学者均值近邻度'
                },
                xAxis: {
                    type: 'category',
                    name: '学术年龄',
                    min:'1',
                    max:'25',
                    data: axis
                },
                yAxis: {
                    type: 'value'
                },
                tooltip: {
                },
                
                series: [
                    {
                        data: ncxis,
                        type: 'line',
                        animationDuration: 10000,
                        animationEasing: "cubicInOut",
                        tooltip:{
                                formatter:function(params){
                                    let show = ""
                                    const data = values[axis[params.dataIndex]]
                                    show += `<a>学术年龄${axis[params.dataIndex]}</a><br/>`
                                    show += `<a>人数${data[0]}</a><br/>`
                                    show += `<a>均值近邻度${params.data}</a><br/>`
                                    return show
                                }
                            }
                    }
            ]
            };
             myChart.setOption(option);
        }
    
    const handelDataChange =  () =>{
        if(props.paperData === null){
            console.log("empty")
        }else{
            const graphData =  crerateGraph(props.paperData)

            

            initOption( graphData )
        }   
    }


    
    useEffect(handelDataChange)
    return (
    <div id={UID} style={props.style}>
    </div>
    )

}

