import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import * as echarts from 'echarts';
import { use } from 'echarts';


//论文作者之间合作关系

const crerateGraph = (paperList) => {//作者之间有过论文合作 即同一篇论文作者s 则存在边
    console.log("paper list = ", paperList)
    let autherPapers = {}//作者的paper  autherPapers["jack"] = [156,258,372,...]
    paperList.forEach((paper, index) => {
        paper["AuthorNames-Deduped"].forEach(name => {
            if (autherPapers[name] === undefined) {
                autherPapers[name] = [index]
            } else {
                autherPapers[name].push(index)
            }
        })
    })

    let nodes = Object.keys(autherPapers)
    let edgeSet = new Set()
    let edges = []
    nodes.forEach((currentName, currentIndex) => {
        const a = autherPapers[currentName]
        nodes.forEach((name, index) => {
            if (currentIndex < index) {
                const b = autherPapers[name]
                for (let _a of a) {
                    for (let _b of b) {
                        if (_a === _b) {
                            edgeSet.add(`${currentIndex}-${index}`)
                            break
                        }
                    }
                }
            }
        })
    })
    edgeSet.forEach(edge => {
        edges.push(edge.split("-"))
    })
    return {
        nodes: nodes,// [name_1,name_2,......]
        edges: edges,//  [  [学者姓名index_1  -> 学者姓名index_2]  , ...]
        autherPapers: autherPapers,//  作者 -> [paper_1_index,paper_2_index,...] 
        paperMap: paperList// []  paperindex -> {title:...,doi:...,...}
    }
}


const getConference = (graph) => { //论文发表所属会议
    console.log("graph =  ", graph)
    let count = {}   //count["conference"]=10
    graph.paperMap.forEach((paper) => {
        count[paper.Conference] = count[paper.Conference] + 1 || 1
    }
    )
    return count;
}




export default function ConferenceMode(props) {
    const UID = "w9378rgfyu3w587tgafgw0837gaa9sdfzsfdb6z51fb6z5dfbndfn[rohga[5ryi"

    const visualConfig = {
        maxSymbolSize: 10,
        maxEdgeWidth: 10,
        seriesNum: 8
    }

    const initOption = (data) => {
        var chartDom = document.getElementById(UID);
        var myChart = echarts.init(chartDom);
        myChart.clear()

        // let links = []

        // let nodes = []

        // let nodeSize = {}
        // let maxNode = 1

        // const degreeData = degreeCentrality(data)

        // const ncData = neighborConnectivity(data,degreeData)




        let pieData = [
            // {value: seriesData[minAge], name: minAge},
            // {value: seriesData[maxAge], name: maxAge},
            // {value: 580, name: '邮件营销'},
            // {value: 484, name: '联盟广告'},
            // {value: 300, name: '视频广告'}
        ]

        const ConferenceCount =  getConference(data)
        Object.keys(ConferenceCount).forEach(
            (k) => {
                pieData.push(
                    {
                        value:ConferenceCount[k],
                        name:k
                    }
                )
            }
        )




        const option = {
            title: {
                text: '论文所属会议分布',
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: '{a} {b} </br> {c}篇 </br>(占比{d}%)'
            },
            legend: {
                orient: 'vertical',
                left: 'left',
            },
            series: [
                {
                    name: '会议：',
                    type: 'pie',
                    radius: '50%',
                    data: pieData,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
        myChart.setOption(option)

    }

    const handelDataChange = () => {
        if (props.paperData === null) {
            console.log("empty")
        } else {
            const graphData = crerateGraph(props.paperData)
            
            initOption(graphData)
        }
    }

    useEffect(handelDataChange)
    return (
        <div id={UID} style={props.style} ></div>
    )

}