import _ from "lodash";
import senitize from "sanitize-filename";
import jieba from "nodejieba";
import {
    GraphData,
    WeChatMember,
    WeChatMemberBundle,
    WeChatMessage,
    WeChatMessageBundle,
    WeChatMessageType,
} from "./types";

export class MessageBundle {
    bundle: WeChatMessageBundle;
    projectName: string;
    constructor(rawBundle: Buffer, projectName: string) {
        this.bundle = JSON.parse(rawBundle.toString());
        this.removeGroupOwner().cleanName();
        this.projectName = projectName;
    }
    get isGroup(): Boolean {
        return this.bundle.type === "group";
    }
    get members(): WeChatMemberBundle {
        return this.bundle.member;
    }
    private extractSenderName(msg: WeChatMessage): string {
        try {
            if (
                !_.isEmpty(msg.m_nsRealChatUsr) &&
                this.members[msg.m_nsRealChatUsr]
            )
                return this.members[msg.m_nsRealChatUsr].name;
            return this.members[msg.m_nsFromUsr].name;
        } catch (error) {
            return "";
        }
    }
    removeGroupOwner() {
        if (this.isGroup) {
            this.bundle.message = this.bundle.message.filter((wcm) => {
                if (wcm.m_nsRealChatUsr === this.bundle.owner.user)
                    return false;
                const sender = _.isEmpty(wcm.m_nsRealChatUsr)
                    ? wcm.m_nsFromUsr
                    : wcm.m_nsRealChatUsr;
                return this.bundle.member[sender];
            });
        }
        return this;
    }
    cleanName() {
        for (const wxid in this.bundle.member) {
            if (
                Object.prototype.hasOwnProperty.call(this.bundle.member, wxid)
            ) {
                this.bundle.member[wxid].name = senitize(
                    this.bundle.member[wxid].name.replace(/.*{1}(\t)?\s?/g, "")
                );
                if (_.isEmpty(this.bundle.member[wxid].name)) {
                    delete this.bundle.member[wxid];
                    continue;
                }
                this.bundle.member[wxid].wxid = wxid;
            }
        }
        return this;
    }
    generateTimeGraphData(): GraphData {
        const result: any[] = [];
        for (let i = 0; i < 24; i++) {
            result.push({ hour: i, count: 0 });
        }
        this.bundle.message.forEach((wcm) => {
            let d = new Date(wcm.m_uiCreateTime * 1000);
            result.find((r) => r.hour === d.getHours()).count++;
        });
        return {
            data: result,
            fields: ["hour", "count"],
            name: `${this.projectName}/TimeGraph.csv`,
        };
    }
    generateMemberGraphData(
        callback: (
            member: WeChatMember,
            bundle: WeChatMessageBundle
        ) => GraphData
    ): Array<GraphData> {
        const result: GraphData[] = [];
        for (const wxid in this.members) {
            if (Object.prototype.hasOwnProperty.call(this.members, wxid)) {
                const member: WeChatMember = this.members[wxid];
                result.push(callback(member, this.bundle));
            }
        }
        return result;
    }
    wordsCount(searchWords: Array<string>): any {
        const result: any = {};
        for (const wxid in this.members) {
            if (Object.prototype.hasOwnProperty.call(this.members, wxid)) {
                const member = this.members[wxid];
                result[member.name] = 0;
            }
        }
        searchWords.forEach((word) => {
            this.bundle.message
                .filter((m) => m.m_uiMessageType === WeChatMessageType.Text)
                .forEach((msg) => {
                    if (
                        msg.m_nsContent.includes(word) &&
                        !_.isEmpty(this.extractSenderName(msg))
                    ) {
                        result[this.extractSenderName(msg)]++;
                    }
                });
        });
        return result;
    }
}
