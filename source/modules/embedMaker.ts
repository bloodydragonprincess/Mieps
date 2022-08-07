import * as Discord from "discord.js"

import * as Lang from "../lang/embedMaker.js"

//TODO Embed witg Attachment
/**
 * creates a embed from a message
 * @param message message to create mebed from
 * @param showUserIcon if the authors icon should be included
 * @param showUserName if the users name should be included
 * @param showTimestamp if the original message timestamp should be included
 */
export async function embedFromMessage(
	message: Discord.Message,
	showUserIcon: boolean = true,
	showUserName: boolean = true,
	showTimestamp: boolean = true
): Promise<EmbedWithAttachments>
{
	
	// if the message is another bot embed, copy it
	if (message.author.bot && message.embeds.length === 1 && message.content.trim() === "")
	{
		return {embed: Discord.EmbedBuilder.from(message.embeds[0]), attachments: getMessageAttachments(message)};
	}

	let embed = new Discord.EmbedBuilder();

	// set embeds author
	let av: string | null = null;

	if (showUserIcon)
	{ 
		av = message.author.avatarURL();
	}

	if (showUserName)
	{

		if (message.member !== null)
		{
			embed = embed.setAuthor( {name: message.member.displayName, iconURL: av ?? undefined });
		}
		else
		{
			embed = embed.setAuthor({name: message.author.username, iconURL: av ?? undefined });
		}

	}

	// colorize embed
	if (message.member !== null)
	{
		embed = embed.setColor( message.member.displayColor );
	}
	else
	{
		embed = embed.setColor('#ffffff');
	}

	if(message.content){
		// add content
		embed = embed.setDescription( message.content );
	}

	if (showTimestamp)
	{
		embed = embed.setTimestamp( message.createdTimestamp );
	}

	// fetch reply and add preview text
	let replyMsg: Discord.Message | null = null;

	if (message.reference?.channelId === message.channel.id && message.reference.messageId)
	{
		try {
			replyMsg = await message.channel.messages.fetch( message.reference.messageId );
		}
		catch {}
		
		if (replyMsg)
		{
			let replyTxt = "> " + replyMsg.cleanContent;

			replyTxt = replyTxt.replace( /(\r\n|\r|\n)/gm, "\n> ");

			if (replyTxt.length > 64)
			{
				replyTxt = replyTxt.slice(0, 64 - 3) + "...";
			}

			let authorName = "";

			if (replyMsg.member !== null)
			{
				authorName = replyMsg.member.displayName;
			}
			else
			{
				authorName = replyMsg.author.username;
			}

			embed = embed.addFields([{name: `\u2514\u2500\u25b7 ${ Lang.reply } ${authorName}:`, value: replyTxt}]);
		}
	}
	// reattach image
	let attachment = message.attachments.first();

	if (attachment && (attachment.width || attachment.height))
	{
		embed = embed.setImage( `attachment://${attachment.name}` );
	}
	//TODO Make list of Embeds foreach Attachment
	return {embed: embed, attachments: getMessageAttachments(message)};
}

/**
 * Interface to Control all 
 */
export interface EmbedWithAttachments{
	embed: Discord.EmbedBuilder;
	attachments: Discord.Attachment[];
}

/**
 * Get all Attachments attachet to message
 * 
 * @param message Message
 * @returns List of all found Attachments
 */
function getMessageAttachments(message: Discord.Message): Discord.Attachment[] {
	let attachments = [];
	for (let att of message.attachments.values()) {
		attachments.push(att);
	}
	return attachments;
}
