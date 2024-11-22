type BroadcasterClipsParams = {
	broadcaster_id: string;
	started_at: string;
	ended_at?: string;
	first: number;
	game_id?: never;
};

type CategoryClipsParams = {
	game_id: string;
	started_at: string;
	ended_at?: string;
	first: number;
	broadcaster_id?: never;
};

export type GetClipsQueryParams = BroadcasterClipsParams | CategoryClipsParams;

export type Clip = {
	id: string;
	url: string;
	embed_url: string;
	broadcaster_id: string;
	broadcaster_name: string;
	creator_id: string;
	creator_name: string;
	video_id: string;
	game_id: string;
	language: string;
	title: string;
	view_count: number;
	created_at: string;
	thumbnail_url: string;
	duration: number;
	vod_offset: number;
	is_featured: boolean;
};

export type TwitchCategory = {
	id: string;
	name: string;
	box_art_url: string;
};

export type CategorySearchResult = {
	id: string;
	name: string;
	boxArtUrl: string;
};
