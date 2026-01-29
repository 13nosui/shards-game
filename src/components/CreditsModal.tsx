import { Dialog, Button, Flex, Text, Heading, ScrollArea, Box, IconButton } from '@radix-ui/themes';
import { Info } from 'lucide-react';
import creditsData from '../data/credits.json';

export const CreditsModal = () => {
    return (
        <Dialog.Root>
            <Dialog.Trigger>
                <IconButton
                    variant="ghost"
                    color="gray"
                    highContrast
                    size="3"
                    className="cursor-pointer"
                    title="Credits"
                >
                    <Info size={20} />
                </IconButton>
            </Dialog.Trigger>

            <Dialog.Content maxWidth="450px" style={{ maxHeight: '80vh', overflow: 'hidden' }}>
                <Dialog.Title>Credits</Dialog.Title>
                <Dialog.Description size="2" mb="4">
                    SHARDS is brought to you by:
                </Dialog.Description>

                <ScrollArea type="auto" scrollbars="vertical" style={{ maxHeight: '50vh' }}>
                    <Flex direction="column" gap="4">
                        <Box>
                            <Heading size="3" mb="2">Development Team</Heading>
                            {creditsData.developers.map((dev, index) => (
                                <Flex key={index} justify="between" mb="1">
                                    <Text size="2" weight="bold">{dev.role}</Text>
                                    <Text size="2">{dev.name}</Text>
                                </Flex>
                            ))}
                        </Box>

                        <Box>
                            <Heading size="3" mb="2">Special Thanks</Heading>
                            {creditsData.specialThanks.length > 0 ? (
                                <Flex direction="row" gap="2" wrap="wrap">
                                    {creditsData.specialThanks.map((name, index) => (
                                        <Text key={index} size="2" className="opacity-70">
                                            {name}{index < creditsData.specialThanks.length - 1 ? ' •' : ''}
                                        </Text>
                                    ))}
                                </Flex>
                            ) : (
                                <Text size="2" color="gray" className="italic">
                                    Looking for our first supporters... is that you?
                                </Text>
                            )}
                        </Box>
                    </Flex>
                </ScrollArea>

                <Flex gap="3" mt="5" justify="end" align="center">
                    <Button variant="solid" asChild>
                        <a href={creditsData.feedbackUrl} target="_blank" rel="noopener noreferrer">
                            Join the Credits / Give Feedback
                        </a>
                    </Button>
                    <Dialog.Close>
                        <Button variant="soft" color="gray">
                            Close
                        </Button>
                    </Dialog.Close>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
};
