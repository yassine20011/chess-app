export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `block mb-2 text-sm font-medium text-gray-900 ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
