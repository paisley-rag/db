import {
  knowledgeBaseService,
  ServerKnowledgeBaseConfig,
} from "@/services/knowledge-base-service";
import { ArrowLeftIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Typography } from "../Typography";
import { useState } from "react";
import { SkeletonPageKnowledgeBase } from "../skeletons/SkeletonPageKnowledgeBase";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ModalFileUpload } from "../ModalFileUpload";
import { ErrorMessageWithReload } from "../ErrorMessageWithReload";

interface PageKnowledgeBaseProps {
  id: string;
}

export function PageKnowledgeBase({ id }: PageKnowledgeBaseProps) {
  const { data, isLoading, error } = useQuery<ServerKnowledgeBaseConfig>({
    queryKey: ["knowledge-base", id],
    queryFn: () => knowledgeBaseService.fetchKnowledgeBaseById(id),
  });
  const [, setLocation] = useLocation();
  const [modalVisible, setModalVisible] = useState(false);

  function handleBackClick(e: React.SyntheticEvent) {
    e.preventDefault();
    setLocation("/knowledge-bases/");
  }

  if (isLoading) {
    return <SkeletonPageKnowledgeBase />;
  }

  if (error) {
    return <ErrorMessageWithReload />;
  }

  if (data)
    return (
      <>
        <header className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleBackClick}>
            <ArrowLeftIcon />
          </Button>
          <Typography variant="h3">{data.kb_name}</Typography>
        </header>

        <header className="flex items-baseline justify-between">
          <Typography variant="h4">Files</Typography>
          <Button onClick={() => setModalVisible(true)}>Upload File</Button>
        </header>
        {/* TODO: Make into DataTable instead, maybe add pagination? */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>File Type</TableHead>
              <TableHead>Date uploaded</TableHead>
              <TableHead>Time uploaded</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.files.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography variant="p" className="text-center my-12">
                    No files uploaded
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.files.map((file) => (
                <TableRow key={file.file_name}>
                  <TableCell>{file.file_name}</TableCell>
                  <TableCell>{file.content_type}</TableCell>
                  <TableCell>{file.date_uploaded}</TableCell>
                  <TableCell>{file.time_uploaded}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {modalVisible && (
          <ModalFileUpload setModalVisible={setModalVisible} id={id} />
        )}
      </>
    );
}
