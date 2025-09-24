function TodoItem({
  todoId,
  todoName,
  todoDate,
  completed,
  priority,
  onDeleteClick,
}) {
  const priorityColors = {
    low: "#28a745",
    medium: "#ffc107",
    high: "#dc3545",
  };

  return (
    <div className="container">
      <div className="row kg-row">
        <div className="col-5">
          <span
            style={{
              textDecoration: completed ? "line-through" : "none",
              color: completed ? "#6c757d" : "#000",
            }}
          >
            {todoName}
          </span>
          {completed && (
            <span style={{ color: "#28a745", marginLeft: "10px" }}>✅</span>
          )}
        </div>
        <div className="col-3">{todoDate}</div>
        <div className="col-2">
          <span
            style={{
              backgroundColor: priorityColors[priority] || "#6c757d",
              color: "white",
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              textTransform: "uppercase",
            }}
          >
            {priority}
          </span>
        </div>
        <div className="col-2">
          <button
            type="button"
            className="btn btn-danger kg-button"
            onClick={() => onDeleteClick(todoId)}
            style={{ fontSize: "12px", padding: "4px 8px" }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default TodoItem;
