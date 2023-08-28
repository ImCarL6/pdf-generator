import { IsString, IsOptional } from "class-validator";

export class pdfDto {
    @IsString()
    @IsOptional()
    language?: string
}