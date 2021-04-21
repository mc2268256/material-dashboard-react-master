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
        if(max !== min){
            result[name] = max-min
        }
    })
    return result;
}



export default function CooperationRelation(props){
    const UID ="w9378rgfyu3w587tgafgw0837gaa9p8h49w[8ro3ay8wraw[rohga[5ryi"
    
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
            
            data.edges.forEach( edge => {
                links.push(
                    {
                        "source": edge[0],
                        "target": edge[1],
                    }
                )
                if( nodeSize[edge[0]] === undefined){
                    nodeSize[edge[0]] = 1
                }else{
                    nodeSize[edge[0]] += 1
                    if(maxNode < nodeSize[edge[0]] ){
                        maxNode = nodeSize[edge[0]]
                    }
                }
                if( nodeSize[edge[1]] === undefined){
                    nodeSize[edge[1]] = 1
                }else{
                    nodeSize[edge[1]] += 1
                    if(maxNode < nodeSize[edge[1]] ){
                        maxNode = nodeSize[edge[1]]
                    }
                }
                
            })

            console.log(maxNode)

            data.nodes.forEach( (name,index) => {
                nodes.push(
                    {
                        "id":index,
                        "name":name,
                        "connectedNum":nodeSize[index],
                        "symbolSize":  5,
                        "attributes": {
                            "modularity_class": 0
                        },
                        "label": {
                            "normal": {
                                "show": false
                        }
                        },
                        // "category": Math.ceil(Math.random()*visualConfig.seriesNum)
                        category: Math.round (((nodeSize[index] || 0) * visualConfig.seriesNum ) / maxNode)
                    }
                )
            })

            var graph = {
                "nodes": nodes,
                "links": links
            }


            var categories = [];
            const steep = maxNode / visualConfig.seriesNum
            for (var i = 0; i < visualConfig.seriesNum-1; i++) {
                categories[i] = {
                    name:  Math.ceil(i*steep) +"~"+ Math.ceil((i+1)*steep)
                };
            }




            const option = {
                title: {
                    text: 'Les Miserables',
                    subtext: 'Circular layout',
                    top: 'bottom',
                    left: 'right'
                },
                tooltip: {},
                legend: [{
                    data: categories.map(function (a) {
                        return a.name;
                    })
                }],
                animationDurationUpdate: 1500,
                animationEasingUpdate: 'quinticInOut',
                
                series: [
                    {
                        
                        focusNodeAdjacency: true,
                        name: '论文标题',
                        type: 'graph',
                        layout: 'force',
                        circular: {
                            rotateLabel: true
                        },
                        data: graph.nodes,
                        links: graph.links,
                        categories: categories,
                        roam: true,
                        label: {
                            position: 'right',
                            formatter: '{b}'
                        },
                        
                        itemStyle: { 
                            normal: { // 默认样式
                                label: {
                                    show: false
                                },
                                opacity:1// 图形透明度。支持从 0 到 1 的数字，为 0 时不绘制该图形。默认0.5

                            },
                            emphasis: { // 高亮状态
                               
                            }
                        },
                        lineStyle: { // ========关系边的公用线条样式。
                            normal: {
                                color: 'source',
                                width: 2, 
                                type: 'solid', // 线的类型 'solid'（实线）'dashed'（虚线）'dotted'（点线）
                                curveness: 0.2, //曲度
                            },
                            emphasis: { // 高亮状态
                                
                            }
                        },
                        tooltip:{
                            formatter:function(params){
                               if(params.dataType === 'node'){
                                   return params.data.name+"</br>"+
                                          "合作者数量"+params.data.connectedNum
                                }else if( params.dataType === 'edge'){
                                    const name_s = data.nodes[params.data.source]
                                    const name_t = data.nodes[params.data.target]
                                    const papers_s = data.autherPapers[name_s]
                                    const papers_t = data.autherPapers[name_t]
                                    const unicon = papers_s.filter(function(v){
                                        return papers_t.indexOf(v)!==-1
                                    })
                                    let cooperation = ""
                                    for(let paperIndex of unicon){
                                        cooperation += data.paperMap[paperIndex].Title + "</br>"
                                    }
                                    return    cooperation
                                }
                            }
                        }
                    }
                ]
            }
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
    <div id={UID.current} style={props.style}>
    </div>
    )

}

