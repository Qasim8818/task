export declare class SubmitAnswersDto {
    taskId: number;
    studentId: number;
    answers: {
        mcqId: number;
        selectedOption: number;
    }[];
    startTime: number;
    endTime: number;
}
