import { useParams } from "react-router-dom";

function ApplicationDetail() {
  const { id } = useParams();
  return (
    <div>
      <h2>Application Detail</h2>
      <p>Status, timeline, and notes for application {id} will live here.</p>
    </div>
  );
}

export default ApplicationDetail;
