import Layout from '@/components/Layout'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from 'sonner'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { getNavbarColors } from '@/components/buttonColors/ButtonColors'

const Profile = () => {
  const [profileData, setProfileData] = useState(null)
    const userPosition = localStorage.getItem("user_position");
    const colors = getNavbarColors(userPosition);
  const [loading, setLoading] = useState(true)
  const [editLoading, setEditLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    mobile: ''
  })
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('https://qurithealthcare.com/crmapi/public/api/panel-fetch-profile', {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (response.data.code === 200) {
          setProfileData(response.data.profile)
          setFormData({
            email: response.data.profile?.email,
            mobile: response.data.profile?.mobile
          })
        } else {
          toast.error('Failed to fetch profile data')
        }
      } catch (error) {
        toast.error(error.response?.data?.msg || 'Failed to fetch profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleProfileUpdate = async () => {
    if (!formData.email || !formData.mobile) {
      toast.error('Please fill all fields')
      return
    }

    setEditLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        'https://qurithealthcare.com/crmapi/public/api/panel-update-profile',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.code === 200) {
        toast.success('Profile updated successfully')
        setProfileData(prev => ({
          ...prev,
          email: formData.email,
          mobile: formData.mobile
        }))
      } else {
        toast.error(response.data.msg || 'Failed to update profile')
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to update profile')
    } finally {
      setEditLoading(false)
    }
  }

  return (
    <Layout>
      <div className="  max-w-full p-0 md:p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>
        
        <div className="bg-white rounded-lg border-2 p-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-10 w-24 mt-4" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <Label className="text-gray-600">Name</Label>
                  <div className="mt-1 text-gray-900 font-medium">
                    {profileData?.name || 'N/A'}
                  </div>
                </div>
                
                <div>
                  <Label className="text-gray-600">User Type</Label>
                  <div className="mt-1 text-gray-900 font-medium">
                    {localStorage.getItem("userType") || 'N/A'}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email" className="text-gray-600">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="mobile" className="text-gray-600">Mobile</Label>
                  <Input
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={handleProfileUpdate}
                  disabled={editLoading}
                  className={`${colors.buttonBg} ${colors.buttonHover}`}
                >
                  {editLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : 'Update Profile'}
                </Button>
                
                <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                      Change Password
                    </Button>
                  </DialogTrigger>
                  <ChangePasswordDialog 
                    open={changePasswordOpen} 
                    setOpen={setChangePasswordOpen} 
                  />
                </Dialog>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}

const ChangePasswordDialog = ({ open, setOpen }) => {
  const [isLoading, setIsLoading] = useState(false)
   const userPosition = localStorage.getItem("user_position");
    const colors = getNavbarColors(userPosition);
  const [formData, setFormData] = useState({
    username: localStorage.getItem('mobile') || '',
    old_password: '',
    new_password: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async () => {
    if (!formData.username || !formData.old_password || !formData.new_password) {
      toast.error('Please fill all fields')
      return
    }

    if(formData.old_password == formData.new_password){
        toast.error("old password and new password can't be same")
        return
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        'https://qurithealthcare.com/crmapi/public/api/panel-change-password',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.code === 200) {
        toast.success('Password changed successfully')
        setFormData({
          username: localStorage.getItem('mobile') || '',
          old_password: '',
          new_password: ''
        })
        setOpen(false)
      } else {
        toast.error(response.data.msg )
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to change password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Change Password</DialogTitle>
      </DialogHeader>
      
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="old_password">Old Password</Label>
          <Input
            id="old_password"
            name="old_password"
            type="password"
            value={formData.old_password}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="new_password">New Password</Label>
          <Input
            id="new_password"
            name="new_password"
            type="password"
            value={formData.new_password}
            onChange={handleInputChange}
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isLoading}
          className={`${colors.buttonBg} ${colors.buttonHover}`}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : 'Change Password'}
        </Button>
      </div>
    </DialogContent>
  )
}

export default Profile