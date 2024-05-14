export default function MainContent({ params }) {
  const searchId = params.searchId;


  return <h2>{JSON.stringify(params)}</h2>
}