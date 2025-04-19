import React, { useState, useEffect } from 'react';
import {
  Box, 
  Heading, 
  Text,  
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Spinner,
  Flex,
  Badge,
  useColorModeValue,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import useShowToast from '../hooks/useShowToast';
import { Navigate } from 'react-router-dom';
import { Report } from '../types/types';

const AdminPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const showToast = useShowToast();
  const user = useSelector((state: RootState) => state.user.user);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [recentlyProcessedIds, setRecentlyProcessedIds] = useState<string[]>([]);
  
  const bgColor = useColorModeValue("white", "#161617");
  const textColor = useColorModeValue("gray.800", "white");
  const headerBg = useColorModeValue("gray.100", "gray.700");

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/moderation/reports');
      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setReports(data);
    } catch (error: any) {
      showToast('Lỗi', error.message || 'Không thể tải báo cáo', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.isAdmin) {
      fetchReports();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleAction = async (action: 'delete' | 'ignore') => {
    if (!selectedReport) return;
    
    try {
      setProcessingId(selectedReport._id);
      
      const res = await fetch('/api/moderation/reports/handle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportId: selectedReport._id,
          action,
        }),
      });
      
      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Add visual feedback
      setRecentlyProcessedIds(prev => [...prev, selectedReport._id]);
      setTimeout(() => {
        setRecentlyProcessedIds(prev => prev.filter(id => id !== selectedReport._id));
      }, 3000);
      
      showToast('Thành công', action === 'delete' ? 'Đã xóa bài viết vi phạm' : 'Đã bỏ qua báo cáo', 'success');
      fetchReports();
      onClose();
    } catch (error: any) {
      showToast('Lỗi', error.message || 'Không thể xử lý báo cáo', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  // Add this function to view the post
  const viewPost = (report: Report) => {
    // Navigate to post or open in a new tab
    if (report.postId) {
      window.open(`/${report.postId.postedBy}/post/${report.postId._id}`, '_blank');
    }
  };

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Flex>
    );
  }

  // Redirect non-admin users
  if (!user?.isAdmin) {
    return <Navigate to="/" />;
  }

  return (
    <Box
      p={6}
      borderRadius="lg"
      bg={bgColor}
      color={textColor}
      my={4}
      boxShadow="md"
    >
      <Heading as="h1" size="xl" mb={6}>
        Quản lý nội dung
      </Heading>

      {reports.length === 0 ? (
        <Text>Không có báo cáo nào cần xem xét</Text>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead bg={headerBg}>
              <Tr>
                <Th>Nội dung</Th>
                <Th>Vi phạm</Th>
                <Th>Người báo cáo</Th>  {/* Thêm cột này */}
                <Th>Ngày báo cáo</Th>
                <Th>Trạng thái</Th>
                <Th>Thao tác</Th>
              </Tr>
            </Thead>
            <Tbody>
              {reports.map(report => (
                <Tr 
                  key={report._id} 
                  bg={recentlyProcessedIds.includes(report._id) 
                    ? report.status === 'resolved' && report.resolution === 'deleted'
                      ? "red.100" 
                      : "green.100"
                    : undefined
                  }
                  transition="background-color 0.5s"
                >
                  <Td width="40%" isTruncated>{report.postContent}</Td>
                  <Td>
                    {report.moderationResult?.categories ? (
                      Object.entries(report.moderationResult.categories)
                        .filter(([_, value]) => value)
                        .map(([key]) => (
                          <Badge colorScheme="red" mr={1} key={key}>
                            {key}
                          </Badge>
                        ))
                    ) : (
                      <Text fontSize="sm" color="gray.500">No categories data</Text>
                    )}
                  </Td>
                  <Td>
                    <Badge 
                      colorScheme={report.reportedBy === 'system' ? 'blue' : 'purple'}
                    >
                      {report.reportedByUsername || (report.reportedBy === 'system' ? 'Hệ thống tự động' : 'Người dùng')}
                    </Badge>
                  </Td>
                  <Td>{new Date(report.createdAt).toLocaleDateString()}</Td>
                  <Td>
                    <Badge 
                      colorScheme={report.status === 'pending' ? 'orange' : 'green'}
                    >
                      {report.status === 'pending' ? 'Chờ xử lý' : 'Đã xử lý'}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge 
                      colorScheme={
                        report.severity === 'high' ? 'red' : 
                        report.severity === 'medium' ? 'orange' : 'yellow'
                      }
                    >
                      {report.severity === 'high' ? 'Nghiêm trọng' : 
                      report.severity === 'medium' ? 'Vừa phải' : 'Nhẹ'}
                    </Badge>
                  </Td>
                  <Td>
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setSelectedReport(report);
                        onOpen();
                      }}
                      isDisabled={report.status === 'resolved'}
                      mr={2}
                    >
                      Xem xét
                    </Button>
                    {report.status !== 'resolved' && report.resolution !== 'deleted' && (
                      <Button 
                        size="sm" 
                        colorScheme="blue"
                        onClick={() => viewPost(report)}
                      >
                        Xem bài viết
                      </Button>
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>
              Xem xét nội dung vi phạm
            </AlertDialogHeader>
            <AlertDialogBody>
              {selectedReport && (
                <>
                  <Text fontWeight="bold" mb={2}>Người báo cáo:</Text>
                  <Badge 
                    mb={4} 
                    colorScheme={selectedReport.reportedBy === 'system' ? 'blue' : 'purple'}
                  >
                    {selectedReport.reportedByUsername || (selectedReport.reportedBy === 'system' ? 'Hệ thống tự động' : 'Người dùng')}
                  </Badge>
                  
                  <Text fontWeight="bold" mb={2}>Nội dung:</Text>
                  <Text mb={4}>{selectedReport.postContent}</Text>
                  
                  <Text fontWeight="bold" mb={2}>Loại vi phạm:</Text>
                  <Flex mb={4} wrap="wrap" gap={2}>
                    {selectedReport?.moderationResult?.categories ? (
                      Object.entries(selectedReport.moderationResult.categories)
                        .filter(([_, value]) => value)
                        .map(([key]) => (
                          <Badge colorScheme="red" key={key}>
                            {key}
                          </Badge>
                        ))
                    ) : (
                      <Text fontSize="sm" color="gray.500">No violation categories found</Text>
                    )}
                  </Flex>
                  
                  <Text fontWeight="bold" mb={2}>Mức độ vi phạm:</Text>
                  {selectedReport?.moderationResult?.category_scores ? (
                    Object.entries(selectedReport.moderationResult.category_scores)
                      .filter(([_, score]) => score > 0.1)
                      .sort(([_, a], [__, b]) => b - a)
                      .map(([category, score]) => (
                        <Flex key={category} justify="space-between" mb={1}>
                          <Text>{category}</Text>
                          <Text fontWeight="bold">{(score * 100).toFixed(1)}%</Text>
                        </Flex>
                      ))
                  ) : (
                    <Text fontSize="sm" color="gray.500">No violation scores found</Text>
                  )}
                </>
              )}
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Đóng
              </Button>
              <Button 
                colorScheme="blue" 
                ml={3}
                onClick={() => handleAction('ignore')}
                isLoading={!!processingId && processingId === selectedReport?._id}
              >
                Bỏ qua
              </Button>
              <Button 
                colorScheme="red" 
                ml={3}
                onClick={() => setIsDeleteConfirmOpen(true)}
                isLoading={!!processingId && processingId === selectedReport?._id}
              >
                Xóa bài viết
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <AlertDialog
        isOpen={isDeleteConfirmOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteConfirmOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>
              Xác nhận xóa bài viết
            </AlertDialogHeader>
            <AlertDialogBody>
              Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={() => setIsDeleteConfirmOpen(false)}>
                Huỷ
              </Button>
              <Button 
                colorScheme="red" 
                ml={3} 
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  handleAction('delete');
                }}
                isLoading={!!processingId}
              >
                Xác nhận xóa
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default AdminPage;