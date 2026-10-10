/**
 * v189: which version of the online match protocol this client speaks.
 *
 * The website updates the moment a commit lands; the iPhone app is the copy
 * the player installed, and stays that way until they update it. The two play
 * each other, so the day a change alters what host and guest send each other
 * — the snapshot, the input stream, the replay and pause handshakes, the
 * lobby squad — the old app and the new site would be playing two different
 * games over one wire. That is exactly the "controls disappear, the game
 * glitches" kind of bug, and it would only ever show up between versions.
 *
 * So: every client says this number when it signs in to the match server, the
 * server only pairs, admits to a lobby, a party or a stand players with the
 * same one, and tells whoever is behind to update. A client that says nothing
 * (App Store build 5, websites before v189) speaks 1.
 *
 * BUMP THIS when a change means an older client could not play a newer one
 * correctly. Not for anything else — every bump splits the player pool until
 * the App Store update reaches everyone. server/server.js reads it from here.
 */
export const NET_PROTOCOL = 1;
