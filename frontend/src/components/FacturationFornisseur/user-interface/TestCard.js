import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '../../ui/Card'

export default function ExampleCard() {
  return (
    <div className='flex  justify-center items-center min-h-screen bg-gray-100 p-4'>
      <Card className='w-96 bg-white shadow-lg'>
        <CardHeader>
          <CardTitle>Welcome to My App</CardTitle>
          <CardDescription>This is a simple card example.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-gray-700'>
            This card component is reusable and styled using Tailwind CSS. You can easily modify the
            styles and structure to fit your needs.
          </p>
        </CardContent>
        <CardFooter className='flex justify-end'>
          <button className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'>
            Get Started
          </button>
        </CardFooter>
      </Card>
    </div>
  )
}
