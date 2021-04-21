import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import * as echarts from 'echarts';
import { use } from 'echarts';


//论文作者之间合作关系

const crerateGraph = (paperList) => {//作者之间有过论文合作 即同一篇论文作者s 则存在边
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
        paperMap: paperList//   paperindex -> {title:...,doi:...,...}
    }
}


const academicAge = (graph) => { //学术年龄，一名学者发表论文最近一年时间减去最晚一年时间
    const result = {}
    graph.nodes.forEach((name) => {
        const papers = graph.autherPapers[name]
        let min = 665536;
        let max = 0;
        papers.forEach((index) => {
            const year = Number(graph.paperMap[index].Year)
            min = Math.min(min, year)
            max = Math.max(max, year)
        })
        result[name] = max - min
    })
    return result;
}




export default function AcademicAgeMode(props) {
    const UID = "w9378rgfyu3w587tgafgw0837gaa9p8h49w[8ro3ay8wraw[rohga[5ryizkudfhbjgzgf986z5d41fbz6df4bzdfbzdfbhdfiuargzg98pareghoz"

    const visualConfig = {
        maxSymbolSize: 10,
        maxEdgeWidth: 10,
        seriesNum: 8
    }

    const initOption = (data) => {

        var chartDom = document.getElementById(UID);
        var myChart = echarts.init(chartDom);
        myChart.clear()

        const ageData = academicAge(data)

        let minAge = 65536
        let maxAge = 0

        data.nodes.forEach((name) => {
            minAge = Math.min(ageData[name], minAge)
            maxAge = Math.max(ageData[name], maxAge)
        })

        const legendData = []
        const seriesData = []

        for (let i = minAge; i <= maxAge; i++) {
            legendData.push(i)
            seriesData[i] = 0;
        }

        minAge = minAge === 0 ? 1 : minAge

        data.nodes.forEach((name) => {
            seriesData[ageData[name]]++
        })

        let pieData = [
        ]

        for (let i = minAge; i < maxAge; i++) {
            pieData.push(
                {
                    value: seriesData[i],
                    name: i
                }
            )
        }


        const option = {
            title: {
                text: '学术年龄分布玫瑰图',
                left: 'left'
            },
            tooltip: {
                trigger: 'item',
                formatter: '{a} {b} </br> {c}人 </br>(占比{d}%)'
            },
            // toolbox: {
            //     show: true,
            //     feature: {
            //         mark: { show: true },
            //         dataView: { show: true, readOnly: false },
            //         restore: { show: true },
            //         saveAsImage: { show: true }
            //     }
            // },
            series: [
                {
                    name: '学术年龄',
                    type: 'pie',
                    radius: [30, 120],
                    center: ['50%', '50%'],
                    roseType: 'area',
                    itemStyle: {
                        borderRadius: 8
                    },
                    data: pieData
                }
            ]
        };
        console.log("academicage mode option ", option)
        myChart.setOption(option);
    }

    const handelDataChange = () => {
        console.log()
        if (props.paperData === null || props.paperData.length === 0) {
            console.log("empty")
        } else {
            const graphData = crerateGraph(props.paperData)
            console.log("log from ACADEMICAGEMODE init graph ", graphData)
            initOption(graphData)
        }
    }

    useEffect(handelDataChange)
    return (
        <div id={UID} style={props.style} ></div>
    )

}