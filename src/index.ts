import path from "path";
import fs from "fs";
import _ from "lodash";
import jieba from "nodejieba";
import { MessageBundle } from "./MessageBundle";
import {
    GraphData,
    WeChatMember,
    WeChatMessageBundle,
    WeChatMessageType,
} from "./types";
let messageBundle = fs.readFileSync(
    path.resolve(__dirname, `../${process.argv[2]}`)
);

var projectName = path
    .basename(path.resolve(__dirname, `../${process.argv[2]}`))
    .replace(/\..*/g, "");
if (!fs.existsSync(path.resolve("./out", projectName))) {
    fs.mkdirSync(path.resolve("./out", projectName));
}

var mb = new MessageBundle(messageBundle, projectName);

function export2CSV(graphData: GraphData) {
    const Json2csvParser = require("json2csv").Parser;
    const json2csvParser = new Json2csvParser({ fields: graphData.fields });
    const csvStr = json2csvParser.parse(graphData.data);
    try {
        let dirname = path.dirname(`./out/${graphData.name}`);
        if (!fs.existsSync(dirname)) {
            fs.mkdirSync(dirname);
        }
        fs.writeFileSync(`./out/${graphData.name}`, csvStr, {
            encoding: "utf-8",
        });
    } catch (error) {
        console.error(error);
    }
}

export2CSV(mb.generateTimeGraphData());
export2CSV(wholeWordsCount());
mb.generateMemberGraphData(messageMonthCount).forEach((val) => export2CSV(val));
mb.generateMemberGraphData(messageDayCount).forEach((val) => export2CSV(val));
mb.generateMemberGraphData(memberWordsCount).forEach((val) => export2CSV(val));

function messageMonthCount(
    member: WeChatMember,
    bundle: WeChatMessageBundle
): GraphData {
    const result: any[] = [];
    for (let i = 1; i <= 12; i++) {
        result.push({ month: i, count: 0 });
    }
    bundle.message
        .filter(
            (v) =>
                v.m_nsRealChatUsr === member.wxid ||
                v.m_nsFromUsr === member.wxid
        )
        .forEach((val) => {
            let d = new Date(val.m_uiCreateTime * 1000);
            result.find((r) => r.month === d.getMonth() + 1).count++;
        });
    return {
        data: result,
        fields: ["month", "count"],
        name: `${projectName}/month/${member.name}-TimeGraph.csv`,
    };
}

function messageDayCount(
    member: WeChatMember,
    bundle: WeChatMessageBundle
): GraphData {
    const result: any[] = [];
    for (let i = 0; i < 24; i++) {
        result.push({ hour: i, count: 0 });
    }
    bundle.message
        .filter(
            (v) =>
                v.m_nsRealChatUsr === member.wxid ||
                v.m_nsFromUsr === member.wxid
        )
        .forEach((val) => {
            let d = new Date(val.m_uiCreateTime * 1000);

            result.find((r) => r.hour === d.getHours()).count++;
        });
    return {
        data: result,
        fields: ["hour", "count"],
        name: `${projectName}/day/${member.name}-TimeGraph.csv`,
    };
}

function memberWordsCount(
    member: WeChatMember,
    bundle: WeChatMessageBundle
): GraphData {
    const result: any[] = [];
    bundle.message
        .filter(
            (v) =>
                (v.m_nsRealChatUsr === member.wxid ||
                    v.m_nsFromUsr === member.wxid) &&
                v.m_uiMessageType === WeChatMessageType.Text
        )
        .forEach((val) => {
            jieba
                .cutHMM(val.m_nsContent)
                .filter((w) => w.length > 1)
                .forEach((w) => {
                    if (result.findIndex((r) => r.word === w) === -1) {
                        result.push({ 单词: w, 词频: 0 });
                    }
                    result.find((r) => r.单词 === w).词频++;
                });
        });
    return {
        data: result.filter((r) => r.词频 > 2),
        fields: ["单词", "词频"],
        name: `${projectName}/memberWords/${member.name}-memberWords.csv`,
    };
}

function wholeWordsCount(): GraphData {
    const result: any[] = [];
    mb.bundle.message
        .filter((v) => v.m_uiMessageType === WeChatMessageType.Text)
        .forEach((val) => {
            jieba
                .cutHMM(val.m_nsContent)
                .filter((w) => w.length > 1)
                .forEach((w) => {
                    if (result.findIndex((r) => r.word === w) === -1) {
                        result.push({ 单词: w, 词频: 0 });
                    }
                    result.find((r) => r.单词 === w).词频++;
                });
        });
    return {
        data: result.filter((r) => r.词频 > 2),
        fields: ["单词", "词频"],
        name: `${projectName}/Words.csv`,
    };
}

function chatWordsCount() {
    const wordLists = [
        {
            list: [
                "艹",
                "操",
                "妈的",
                "滚",
                "傻逼",
                "sb",
                "傻",
                "nt",
                "智障",
                "草",
                "槽",
                "wdnmd",
                "cnm",
                "md",
                "草泥马",
                "草你妈",
                "草你妈",
                "日",
                "淦",
            ],
            name: "表示骂人",
        },
        {
            list: [
                "hhhh",
                "哈哈",
                "哈哈哈哈哈哈",
                "xswl",
                "xs",
                "笑死我了",
                "笑死",
            ],
            name: "表示开心",
        },
        {
            list: [
                "游戏",
                "打游戏",
                "play",
                "game",
                "玩吗",
                "玩不",
                "玩否",
                "来一把",
                "上号",
            ],
            name: "打游戏",
        },
    ];
    wordLists.forEach((wl) => {
        const res = mb.wordsCount(wl.list);
        const csvResult = [];
        for (const name in res) {
            if (Object.prototype.hasOwnProperty.call(res, name)) {
                const cnt = res[name];
                csvResult.push({
                    name: name,
                    count: cnt,
                });
            }
        }
        export2CSV({
            data: csvResult,
            fields: ["name", "count"],
            name: `${projectName}/division/${wl.name}.csv`,
        });
    });
}

chatWordsCount();
