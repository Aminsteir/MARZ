import { ChevronRight } from "lucide-react";
import { JSX } from "react/jsx-dev-runtime";

interface BreadcrumbProps {
  icon?: JSX.Element;
  path: string[];
  onNavigate: (idx: number) => void;
  className?: string;
}

export default function Breadcrumb({
  path,
  onNavigate,
  icon,
  className,
}: BreadcrumbProps) {
  return (
    <nav
      className={`flex px-5 py-3 text-gray-700 border border-gray-200 rounded-lg bg-gray-50 ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        {path.map((name, idx) => {
          const isLast = idx === path.length - 1;
          return (
            <li key={idx} className="inline-flex items-center gap-3">
              {!isLast ? (
                <>
                  <button
                    onClick={() => onNavigate(idx)}
                    className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 gap-4 cursor-pointer"
                  >
                    {idx === 0 && icon !== undefined ? icon : null}
                    {name}
                  </button>
                  <ChevronRight color="currentColor" />
                </>
              ) : (
                <span className="text-sm font-medium text-gray-500">
                  {name}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
