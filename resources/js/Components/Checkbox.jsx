export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-gray-300 text-brand2-600 shadow-sm focus:ring-brand2-500 ' +
                className
            }
        />
    );
}
