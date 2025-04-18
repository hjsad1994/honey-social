import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import useShowToast from "./useShowToast";
import { User } from "../types/types";
import { RootState } from "../store/store";

interface UseFollowUnfollowProps {
  handleFollowToggle: () => Promise<void>;
  isFollowing: boolean;
  followers: string[];
  isLoading: boolean;
}

const useFollowUnfollow = (
  user: User | null,
  onFollowUpdate?: (updatedUser: User) => void
): UseFollowUnfollowProps => {
  const currentUser = useSelector((state: RootState) => state.user.user);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [followers, setFollowers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const showToast = useShowToast();

  // Cập nhật state khi user hoặc currentUser thay đổi
  useEffect(() => {
    if (user && currentUser) {
      setIsFollowing(user.followers.includes(currentUser._id));
      setFollowers([...user.followers]);
    }
  }, [user?._id, currentUser?._id]);

  // Hàm xử lý follow/unfollow
  const handleFollowToggle = async (): Promise<void> => {
    if (!currentUser) {
      showToast("Error", "Bạn phải đăng nhập để theo dõi người dùng", "error");
      return;
    }

    if (!user) {
      showToast("Error", "Không tìm thấy thông tin người dùng", "error");
      return;
    }
    
    setIsLoading(true);
    
    // Lưu trạng thái hiện tại để rollback nếu cần
    const wasFollowing = isFollowing;
    
    // Cập nhật UI trước (Optimistic UI update)
    setIsFollowing(!wasFollowing);
    
    const newFollowers = [...followers];
    
    if (wasFollowing) {
      // Unfollow - remove currentUser from followers
      const index = newFollowers.indexOf(currentUser._id);
      if (index > -1) {
        newFollowers.splice(index, 1);
      }
    } else {
      // Follow - add currentUser to followers
      if (!newFollowers.includes(currentUser._id)) {
        newFollowers.push(currentUser._id);
      }
    }
    
    // Update followers count in UI
    setFollowers(newFollowers);
    
    try {
      // Call API
      const res = await fetch(`/api/users/follow/${user._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      });
      
      const data = await res.json();
      
      if (data.error && data.error !== "followed successfully" && data.error !== "unfollowed successfully") {
        // If API fails, revert UI changes
        setIsFollowing(wasFollowing);
        setFollowers(followers);
        showToast("Error", data.error, "error");
      } else {
        // API success - update user object with new followers
        const updatedUser: User = {
          ...user,
          followers: newFollowers
        };
        
        // Notify parent component
        if (onFollowUpdate) {
          onFollowUpdate(updatedUser);
        }
        
        // Show success toast
        const message = wasFollowing ? "Đã hủy theo dõi" : "Đã theo dõi";
        showToast("Thành công", `${message} ${user.name}`, "success");
      }
    } catch (error: any) {
      // Revert UI on error
      setIsFollowing(wasFollowing);
      setFollowers(followers);
      showToast("Error", error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return { handleFollowToggle, isFollowing, followers, isLoading };
};

export default useFollowUnfollow;