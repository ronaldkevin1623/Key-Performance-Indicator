import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from "@mui/material";
import api from "@/lib/api";

const { tasksApi } = api;

const AssignedTasksTable = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Use tasksApi.getAll() which fetches only the current employee's tasks
    tasksApi.getAll().then(data => {
      setTasks(Array.isArray(data) ? data : data?.data?.tasks || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-center py-12">Loading tasks...</div>;

  if (tasks.length === 0)
    return <div className="text-center py-12">No tasks have been assigned to you.</div>;

  return (
    <div className="max-w-5xl mx-auto py-10">
      <h2 className="text-2xl font-bold mb-4">Assigned Tasks</h2>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Task Owner</TableCell>
              <TableCell>Task Title</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task._id}>
                <TableCell>
                  {task.assignedBy?.firstName} {task.assignedBy?.lastName}
                </TableCell>
                <TableCell>
                  <Button variant="text" color="primary" onClick={() => navigate(`/tasks/${task._id}`)}>
                    {task.title}
                  </Button>
                </TableCell>
                <TableCell>
                  {task.startDate
                    ? new Date(task.startDate).toLocaleString()
                    : "-"}
                </TableCell>
                <TableCell>
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleString()
                    : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default AssignedTasksTable;
