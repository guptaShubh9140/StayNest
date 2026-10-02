const Card = ({
  children,
  className = "",
  padding = "md",
  hover = false,
}) => {
  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-5 sm:p-6",
    lg: "p-6 sm:p-8",
  };

  return (
    <div
      className={[
        "rounded-2xl border border-gray-200 bg-white shadow-sm",
        paddings[padding],
        hover
          ? "transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-lg"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
};

export default Card;