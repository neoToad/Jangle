export const postCardFrameClassName =
  'rounded-[20px] border border-jangle-border bg-jangle-surface p-5 shadow-[0_2px_12px_rgba(0,0,0,0.2)]'

export default function PostCardFrame({ as: Tag = 'article', className = '', children, ...props }) {
  const mergedClassName = className ? `${postCardFrameClassName} ${className}` : postCardFrameClassName
  return (
    <Tag className={mergedClassName} {...props}>
      {children}
    </Tag>
  )
}
