import { useState, useEffect } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { Camera, CircleCheckBig, Upload, X } from 'lucide-react'
import Webcam from 'react-webcam'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

export default function Dashboard() {
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)
  const [webcamRef, setWebcamRef] = useState<any>(null)
  const [hasAttendedToday, setHasAttendedToday] = useState(false)

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: 'user',
  }

  // Check if user has attended today
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          'http://localhost:5002/v1/api/attendance/my-history',
          {
            headers: { Authorization: `Bearer ${Cookies.get('token')}` },
          }
        )

        const history = res.data.data as any[]
        const today = new Date().toDateString()
        const attended = history.some(
          (item) => new Date(item.clockInTime).toDateString() === today
        )
        setHasAttendedToday(attended)
      } catch (err) {
        console.error('Failed to fetch history', err)
      }
    }

    fetchHistory()
  }, [])

  const openCamera = () => {
    setIsCameraOpen(true)
    setStatus(null)
  }

  const capturePhoto = () => {
    if (!webcamRef) return
    const imageSrc = webcamRef.getScreenshot()
    if (!imageSrc) {
      setStatus({ message: 'Failed to capture image', type: 'error' })
      return
    }

    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        const capturedFile = new File([blob], `attendance-${Date.now()}.jpg`, {
          type: 'image/jpeg',
        })
        setPhotoFile(capturedFile)
        setPhotoPreview(imageSrc)
        setIsCameraOpen(false)
      })
  }

  const clearPhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    setStatus(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      setPhotoPreview(URL.createObjectURL(file))
      setStatus(null)
    }
  }

  const handleSubmit = async () => {
    if (!photoFile) {
      setStatus({
        message: 'Please select or take a photo first.',
        type: 'error',
      })
      return
    }

    setIsLoading(true)
    setStatus({ message: 'Submitting attendance...', type: 'success' })

    const formData = new FormData()
    formData.append('photo', photoFile)

    try {
      const response = await axios.post(
        'http://localhost:5002/v1/api/attendance/clock-in',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${Cookies.get('token')}`,
          },
        }
      )

      if (response.status === 201) {
        setStatus({
          message: 'Attendance submitted successfully.',
          type: 'success',
        })
        setHasAttendedToday(true)
      } else {
        setStatus({ message: 'Failed to submit attendance.', type: 'error' })
      }
    } catch (err) {
      setStatus({ message: 'Failed to submit attendance.', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Header>
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-col items-center justify-center p-4'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle className='text-center text-2xl font-bold tracking-tight'>
              Daily Attendance
            </CardTitle>
            <p className='text-muted-foreground text-center'>
              {hasAttendedToday
                ? 'You have already marked attendance today.'
                : 'Capture a photo of yourself to mark your attendance.'}
            </p>
          </CardHeader>

          <CardContent className='flex flex-col items-center space-y-4'>
            {hasAttendedToday ? (
              <p className='flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-center text-green-700 shadow-sm'>
                <CircleCheckBig color='green' />
                <span className='font-semibold'>
                  Attendance completed for today
                </span>
              </p>
            ) : isCameraOpen ? (
              <div className='w-full space-y-4'>
                <Webcam
                  audio={false}
                  ref={(ref) => setWebcamRef(ref)}
                  screenshotFormat='image/jpeg'
                  videoConstraints={videoConstraints}
                  className='w-full rounded-md border'
                />
                <div className='flex justify-between'>
                  <Button onClick={capturePhoto} size='lg'>
                    Capture
                  </Button>
                  <Button
                    onClick={() => setIsCameraOpen(false)}
                    variant='outline'
                    size='lg'
                  >
                    Close
                  </Button>
                </div>
              </div>
            ) : photoPreview ? (
              <div className='w-full space-y-4 text-center'>
                <img
                  src={photoPreview}
                  alt='Attendance preview'
                  className='mx-auto max-h-60 rounded-md border'
                />
                <div className='flex justify-center space-x-2'>
                  <Button onClick={handleSubmit} disabled={isLoading} size='lg'>
                    {isLoading ? 'Submitting...' : 'Submit Attendance'}
                  </Button>
                  <Button
                    onClick={clearPhoto}
                    variant='destructive'
                    size='icon'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            ) : (
              <div className='flex w-full justify-between space-x-4'>
                <input
                  type='file'
                  accept='image/*'
                  style={{ display: 'none' }}
                  id='photo-upload'
                  onChange={handleFileChange}
                />

                <Button onClick={openCamera} size='lg'>
                  <Camera className='mr-2 h-5 w-5' /> Take Photo
                </Button>

                <Button
                  onClick={() =>
                    document.getElementById('photo-upload')?.click()
                  }
                  size='lg'
                >
                  <Upload className='mr-2 h-5 w-5' /> Upload Photo
                </Button>
              </div>
            )}

            {status && (
              <p
                className={`mt-4 text-sm font-medium ${status.type === 'error' ? 'text-red-500' : 'text-green-500'}`}
              >
                {status.message}
              </p>
            )}
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
