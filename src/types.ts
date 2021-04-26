export interface WeChatMessage {
    m_nsContent: string;
    m_nsFromUsr: string | any;
    m_nsRealChatUsr: string | any;
    m_nsToUsr: string;
    m_uiCreateTime: number;
    m_uiMesLocalID: number;
    m_uiMesSvrID: number;
    m_uiMessageType: number;
}
export interface WeChatMemberBundle {
    [index: string]: WeChatMember;
}

export type WeChatMember = {
    head: string;
    name: string;
    wxid: string;
};

export interface WeChatMessageOwner {
    head: string;
    name: string;
    user: string;
}
export interface WeChatMessageBundle {
    from: string;
    member: WeChatMemberBundle;
    message: Array<WeChatMessage>;
    owner: WeChatMessageOwner;
    type: string;
}

export interface GraphData {
    data: Array<any>;
    fields: Array<string>;
    name: string; 
}

export enum WeChatMessageType {
    Text = 1,
    Image = 3,
    Sticker = 47,
    RedPocket = 49,
    RecallMessage = 10000,
}
