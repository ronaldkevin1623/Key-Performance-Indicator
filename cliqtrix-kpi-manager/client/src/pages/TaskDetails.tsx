import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/lib/api";

const { tasksApi } = api;

const TaskDetails = () => {
  const { taskId } = useParams();
  const [task, setTask] = useState<any>(null);

  useEffect(() => {
    tasksApi.getById(taskId!).then(resp => {
      setTask(resp.data?.task || resp.task || resp);
    });
  }, [taskId]);

  if (!task) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-2">{task.title}</h2>
      <div className="mb-2 text-gray-500">
        Project: {task.project?.name}
      </div>
      <div>
        <strong>Owner:</strong> {task.assignedBy?.firstName} {task.assignedBy?.lastName} <br />
        <strong>Start:</strong> {task.startDate ? new Date(task.startDate).toLocaleString() : "-"}<br />
        <strong>End:</strong> {task.dueDate ? new Date(task.dueDate).toLocaleString() : "-"}<br />
        <strong>Description:</strong> {task.description}
      </div>
      {/* ...add any other task/project fields you want */}
    </div>
  );
};

export default TaskDetails;
