import React, { useState, useEffect } from "react";
// react plugin for creating charts
import ChartistGraph from "react-chartist";
// @material-ui/core
import { makeStyles } from "@material-ui/core/styles";
import Icon from "@material-ui/core/Icon";
// @material-ui/icons
import Store from "@material-ui/icons/Store";
import Warning from "@material-ui/icons/Warning";
import DateRange from "@material-ui/icons/DateRange";
import LocalOffer from "@material-ui/icons/LocalOffer";
import Update from "@material-ui/icons/Update";
import ArrowUpward from "@material-ui/icons/ArrowUpward";
import AccessTime from "@material-ui/icons/AccessTime";
import Accessibility from "@material-ui/icons/Accessibility";
import BugReport from "@material-ui/icons/BugReport";
import Code from "@material-ui/icons/Code";
import Cloud from "@material-ui/icons/Cloud";
// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Table from "components/Table/Table.js";
import Tasks from "components/Tasks/Tasks.js";
import CustomTabs from "components/CustomTabs/CustomTabs.js";
import Danger from "components/Typography/Danger.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardIcon from "components/Card/CardIcon.js";
import CardBody from "components/Card/CardBody.js";
import CardFooter from "components/Card/CardFooter.js";
import { bugs, website, server } from "variables/general.js";
import AcademicAgeMode from "../../components/AcademicAgeMode"
import datasetFile from "assets/sources/IEEE VIS papers 1990-2018.json";
import {
    dailySalesChart,
    emailsSubscriptionChart,
    completedTasksChart
} from "variables/charts.js";
import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import ConferenceMode from "../../components/ConferenceMode"

const useStyles = makeStyles(styles);

export default function TableList() {
    const classes = useStyles();
    const [paperData, setPaperData] = useState([])//作为统一的数据源 数据的处理在图内部进行
    const paperDataSet = "./api/IEEE VIS papers 1990-2018.json" //论文数据集 之后将数据过滤安排在后端

    const [filtered, setFilted] = useState(null)

    function getPaperDataSet() {
        return new Promise((resolve, reject) => {
            fetch(datasetFile).then(resp =>
                resp.json().then(data => resolve(data))
            )
        })
    }
    useEffect(() => {
        setPaperData(datasetFile)
    }, [])



    return (
        <div>
            <GridContainer>
                <GridItem xs={6}>
                    <ConferenceMode
                            paperData={paperData}
                            style={
                                {
                                    width: "100%",
                                    height: 300
                                }
                            }
                        />
                </GridItem>
                <GridItem xs={6} >   
                    
                </GridItem>
                <GridItem xs={6}>
                    {/* <NcMode
                        paperData={paperData}
                        style={
                            {
                                width: "100%",
                                height: 300
                            }
                        }
                    /> */}
                </GridItem>
                <GridItem xs={6}>
                    {/* <CcMode
                            paperData={paperData}
                            style={
                                {
                                    width: "100%",
                                    height: 300
                                }
                            }
                        /> */}
                </GridItem>
            </GridContainer>

        </div>
    );
}