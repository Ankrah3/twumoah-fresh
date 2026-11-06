import * as React from 'react';
import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from 'react';

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  wide?: boolean;
}

function FieldShell({
  id,
  label,
  error,
  hint,
  wide,
  children,
}: FieldProps & { children: ReactNode }) {
  return (
    <div className={`field ${wide ? 'field-wide' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? (
        <p className="error" id={`${id}-error`}>
          {error}
        </p>
      ) : hint ? (
        <small id={`${id}-hint`}>{hint}</small>
      ) : null}
    </div>
  );
}

function descriptions({ id, error, hint }: FieldProps) {
  return {
    'aria-invalid': error ? (true as const) : undefined,
    'aria-describedby': error ? `${id}-error` : hint ? `${id}-hint` : undefined,
  };
}

export function InputField({
  label,
  error,
  hint,
  wide,
  ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldShell id={props.id} label={label} error={error} hint={hint} wide={wide}>
      <input {...props} {...descriptions({ id: props.id, label, error, hint })} />
    </FieldShell>
  );
}

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

export function SelectField({
  label,
  error,
  hint,
  wide,
  options,
  ...props
}: FieldProps & SelectHTMLAttributes<HTMLSelectElement> & { options: Option[] }) {
  return (
    <FieldShell id={props.id} label={label} error={error} hint={hint} wide={wide}>
      <select {...props} {...descriptions({ id: props.id, label, error, hint })}>
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function TextareaField({
  label,
  error,
  hint,
  wide,
  ...props
}: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldShell id={props.id} label={label} error={error} hint={hint} wide={wide}>
      <textarea {...props} {...descriptions({ id: props.id, label, error, hint })} />
    </FieldShell>
  );
}

export function ErrorNotice({ visible }: { visible: boolean }) {
  return visible ? (
    <p className="error-summary" role="alert">
      A few details need your attention. Check the fields below.
    </p>
  ) : null;
}
