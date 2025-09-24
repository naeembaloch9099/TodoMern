import TodoItem from "./TodoItem";
import styles from "./TodoItems.module.css";

const TodoItems = ({ todoItems, onDeleteClick }) => {
  return (
    <div className={styles.itemsContainer}>
      {todoItems.map((item) => (
        <TodoItem
          key={item._id}
          todoId={item._id}
          todoDate={
            item.dueDate
              ? new Date(item.dueDate).toLocaleDateString()
              : "No due date"
          }
          todoName={item.text}
          completed={item.completed}
          priority={item.priority}
          onDeleteClick={onDeleteClick}
        />
      ))}
    </div>
  );
};

export default TodoItems;
