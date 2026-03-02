import Image from 'next/image'

interface BookCardProps {
  title: string
  author: string
  date: string
  coverImage: string
  category: string
}

export default function BookCard({
  title,
  author,
  date,
  coverImage,
  category,
}: BookCardProps) {
  return (
    <article className="bg-white shadow-card rounded-card hover:shadow-hover hover:-translate-y-1 transition-all duration-200">
      {/* Cover Image */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-card">
        <Image
          src={coverImage}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category Badge */}
        <span className="inline-block bg-accent text-white text-xs px-2 py-1 rounded-full">
          {category}
        </span>

        {/* Title */}
        <h3 className="mt-2 line-clamp-2">{title}</h3>

        {/* Author */}
        <p className="text-sm text-neutral-500 mt-1">{author}</p>

        {/* Date */}
        <p className="text-sm text-primary font-medium mt-2">{date}</p>
      </div>
    </article>
  )
}
