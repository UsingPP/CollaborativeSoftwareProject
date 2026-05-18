
export interface User {
    id? : number;
    email? : string;
    password? : string;
    name? : string;
    department? : string;
    student_id? : string;
    profile_image_url? : string;
    residence? : string;
    intro? : string;
    created_at? : Date;
}

export interface Team {
    id? : number;
    team_name? : string;
    subject_name? : string;
    invite_code? : string;
    status? : string;
    deadline? : Date;
    leader_id? : number;
    created_at? : Date;
}

export interface Team_Member {
    id? : number;
    team_id? : number;
    user_id? : number;
    joined_at? : Date;
}

export interface Task {
    id? : number;
    team_id? : number;
    assignee_id? : number;
    task_name? : string;
    due_date? : Date;
    status?: string;
    created_at? : Date;
    updated_at? : Date;
}

export interface AI_Schedule_Session {
    id?: number;
    team_id?: number;
    goal?: string;
    deadline?: string;
    status?: string;
    created_at?: Date;
}

export interface AI_Schedule_Task {
    id?: number;
    session_id?: number;
    task_name?: string;
    start_date?: string;
    due_date?: string;
    created_at?: Date;
}

export interface Notice {
    id?: number;
    team_id?: number;
    author_id?: number;
    title?: string;
    content?: string;
    is_leader_notice?: boolean;
    created_at?: Date;
}

export interface Reference_Room {
    id?: number;
    team_id?: number;
    uploader_id?: number;
    file_name?: string;
    file_url?: string;
    created_at?: Date;
}

export interface Chat_Room {
    id?: number;
    team_id?: number;
    room_name?: string;
    created_at?: Date;
}

export interface Chat_Room_Member {
    room_id?: number;
    user_id?: number;
    joined_at?: Date;
}

export interface Chat_Message {
    id?: number;
    room_id?: number;
    sender_id?: number;
    message_content?: string;
    created_at?: Date;
}

export interface Evaluation {
    id?: number;
    team_id?: number;
    evaluator_id?: number;
    evaluatee_id?: number;
    score_participation?: number;
    score_responsibility?: number;
    score_communication?: number;
    score_collaboration?: number;
    score_creativity?: number;
    comment?: string;
    created_at?: Date;
}

export const BASE_API_URL = "http://localhost";
export const PORT = "3000";