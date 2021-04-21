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



const localClusteringCoefficient = (graph,DC) => {//聚集系数，描述自中心网络中学者间的合作紧密程度

    const edgeNum = {}
    graph.nodes.forEach(  (name) => {
        edgeNum[name] = 0
    })

    graph.edges.forEach(    (edge) => {
        edgeNum[ graph.nodes[Number(edge[0])]] += 1
        edgeNum[ graph.nodes[Number(edge[1])]] += 1
        }  
        
    ) 

    // const DC = degreeCentrality(graph)
    const result = {}
    graph.nodes.forEach(  (name) => {
        result[name] = (DC[name]===0||DC[name]===1) ? 0 :  ( 2 * edgeNum[name])  /  (    DC[name] * ( DC[name] - 1) )
        
    })
    

    return result
    
    
}


export default function Dcmode(props){
    const UID ="w9378rgfyu3w587tgafgw0837gaa9zdfzssfehbxdgfnxdgjsxtgjnp8h49w[8ro3ay8wraw[rohga[5ryi"
    
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
            // const ncData = neighborConnectivity(data,degreeData)
            const ccData = localClusteringCoefficient(data,degreeData)

            
            let minAge = 65536
            let maxAge = 0

            data.nodes.forEach(  (name) => {
                minAge = Math.min(ageData[name],minAge)
                maxAge = Math.max(ageData[name],maxAge)
            })
            
            console.log(`mini = ${minAge} , max =  ${maxAge}`)
            const axis = [  ]
            
            // const ncvalues = {}            
            const ccvalues = {}


            for(let i =  minAge ; i <= maxAge ; i++ ){
                axis.push(i)  
                ccvalues[i] = [0,0]       
            }

            
            data.nodes.forEach(  (name) => {
                ccvalues[ageData[name]][0] += 1
                ccvalues[ageData[name]][1] += ccData[name]
                console.log("ccData[name]",ccData[name])
            })
          
            
            const ccxis = []

            for(let i =  minAge ; i <= maxAge ; i++ ){
                ccxis.push(ccvalues[i][1] / ccvalues[i][0])    
            }


            const option = {
               

                title: {
                    text: '基于学术年龄的学者聚集系数'
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
                        data: ccxis,
                        type: 'line',
                        animationDuration: 10000,
                        animationEasing: "cubicInOut",
                        tooltip:{
                                formatter:function(params){
                                    let show = ""
                                    const data = ccvalues[axis[params.dataIndex]]
                                    show += `<a>学术年龄${axis[params.dataIndex]}</a><br/>`
                                    show += `<a>人数${data[0]}</a><br/>`
                                    show += `<a>聚集系数${params.data}</a>`
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

