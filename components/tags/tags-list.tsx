import { TagCard } from "./tag-card";

interface TagsListProps {
	tags: { tag: string; count: number }[];
}

export function TagsList({ tags }: TagsListProps) {
	if (!tags?.length) {
		return (
			<div className="text-center py-8">
				<p>No tags found</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
			{tags.map((tag) => (
				<TagCard key={tag.tag} tag={tag.tag} count={tag.count} />
			))}
		</div>
	);
}
