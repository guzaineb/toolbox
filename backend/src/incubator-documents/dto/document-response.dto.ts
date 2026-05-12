export class DocumentResponseDto {
  id: string;
  document_type: string;
  file_url: string;
  verification_status: string;
  uploaded_at: Date;
  uploaded_by_user_id: string;
  uploaded_by: {
    id: string;
    first_name: string;
    last_name: string;
    role: string;
    

  };
  
}